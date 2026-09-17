// Keep Firebase functions together. Local files use ordinary scripts.
const firebase = (function () {

// Firebase handles accounts and the database. 
let auth;
let db;
let authTools;
let databaseTools;

function hasConfig() {
  if (typeof firebaseConfig === 'undefined' || !firebaseConfig) return false;
  for (const key of ['apiKey', 'authDomain', 'projectId', 'appId']) {
    const value = firebaseConfig[key];
    if (typeof value !== 'string' || !value.trim() || value.startsWith('PASTE_')) return false;
  }
  return true;
}

async function connect() {
  // All three Firebase files must use the same version.
  const appTools = await import('https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js');
  authTools = await import('https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js');
  databaseTools = await import('https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js');
  const app = appTools.initializeApp(firebaseConfig);
  auth = authTools.getAuth(app);
  db = databaseTools.getFirestore(app);
  await authTools.setPersistence(auth, authTools.browserSessionPersistence);
  await auth.authStateReady();
}

function getUser() {
  if (!auth || !auth.currentUser) return null;
  return {
    id: auth.currentUser.uid,
    name: auth.currentUser.displayName || 'Reader',
    email: auth.currentUser.email
  };
}

function watchUser(callback) {
  return authTools.onAuthStateChanged(auth, callback);
}

async function register(name, email, password) {
  const account = await authTools.createUserWithEmailAndPassword(auth, email, password);
  await authTools.updateProfile(account.user, { displayName: name });
}

async function login(email, password) {
  await authTools.signInWithEmailAndPassword(auth, email, password);
}

async function logout() {
  await authTools.signOut(auth);
}

async function resetPassword(email) {
  try {
    await authTools.sendPasswordResetEmail(auth, email);
  } catch (error) {
    // Do not reveal whether an email address has an account.
    if (error.code !== 'auth/user-not-found') throw error;
  }
}

// Public quizzes. Emails and passwords are not stored in these documents.
async function getQuizzes() {
  const collection = databaseTools.collection(db, 'quizzes');
  const request = databaseTools.query(collection, databaseTools.orderBy('createdAt', 'desc'), databaseTools.limit(50));
  const snapshot = await databaseTools.getDocs(request);
  const quizzes = [];
  for (const item of snapshot.docs) {
    const quiz = item.data();
    quiz.id = item.id;
    quizzes.push(quiz);
  }
  return quizzes;
}

async function getQuestions(quizId) {
  const collection = databaseTools.collection(db, 'quizzes', quizId, 'questions');
  const request = databaseTools.query(collection, databaseTools.orderBy('position'));
  const snapshot = await databaseTools.getDocs(request);
  const questions = [];
  for (const item of snapshot.docs) questions.push(item.data());
  return questions;
}

async function publishQuiz(title, description, questions) {
  const user = getUser();
  if (!user) throw new Error('Please log in before publishing.');
  const quiz = databaseTools.doc(databaseTools.collection(db, 'quizzes'));
  // A batch saves the quiz and its questions together, or saves nothing.
  const batch = databaseTools.writeBatch(db);
  batch.set(quiz, {
    title: title, description: description,
    questionCount: questions.length, author: user.name, ownerId: user.id,
    createdAt: databaseTools.serverTimestamp()
  });
  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];
    batch.set(databaseTools.doc(quiz, 'questions', String(i)), {
      text: question.text, options: question.options,
      correct: question.correct, position: i
    });
  }
  await batch.commit();
}

async function deleteQuiz(id) {
  const quiz = databaseTools.doc(db, 'quizzes', id);
  const questions = await databaseTools.getDocs(databaseTools.collection(quiz, 'questions'));
  const batch = databaseTools.writeBatch(db);
  for (const question of questions.docs) batch.delete(question.ref);
  batch.delete(quiz);
  await batch.commit();
}

// Scores are under users / user ID / results, not in a public collection.
async function getResults() {
  const user = getUser();
  if (!user) return [];
  const collection = databaseTools.collection(db, 'users', user.id, 'results');
  const request = databaseTools.query(collection, databaseTools.orderBy('createdAt', 'desc'), databaseTools.limit(100));
  const snapshot = await databaseTools.getDocs(request);
  const results = [];
  for (const item of snapshot.docs) {
    const result = item.data();
    result.date = result.createdAt ? result.createdAt.toDate().toLocaleDateString() : 'Today';
    results.push(result);
  }
  return results;
}

async function saveResult(quiz, score, userId, attemptKey) {
  const user = getUser();
  if (!user || user.id !== userId) throw new Error('Your account changed. Start a new attempt to save a score.');
  const path = databaseTools.doc(db, 'users', user.id, 'results', attemptKey);
  await databaseTools.setDoc(path, {
    quizId: quiz.id,
    title: quiz.title,
    score: score,
    total: quiz.questions.length,
    createdAt: databaseTools.serverTimestamp()
  });
}

// Turn Firebase errors into short instructions.
function errorMessage(error) {
  const messages = {
    'auth/email-already-in-use': 'That email already has an account. Please log in.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/invalid-credential': 'Incorrect email or password.',
    'auth/wrong-password': 'Incorrect email or password.',
    'auth/user-not-found': 'Incorrect email or password.',
    'auth/weak-password': 'Choose a stronger password that meets your Firebase password policy.',
    'auth/password-does-not-meet-requirements': 'Your password does not meet the Firebase password policy.',
    'auth/too-many-requests': 'Too many attempts. Please wait before trying again.',
    'auth/network-request-failed': 'Cannot reach Firebase. Check your internet connection.',
    'auth/operation-not-allowed': 'Enable Email/Password in Firebase Authentication, then try again.',
    'auth/unauthorized-domain': 'Add this website domain to Firebase Authentication → Settings → Authorized domains.',
    'auth/invalid-api-key': 'Check the API key in firebase-config.js.',
    'auth/user-disabled': 'This account has been disabled in Firebase.',
    'permission-denied': 'Firestore blocked this request. Check your login and publish the supplied firestore.rules.',
    'unavailable': 'Firestore is unavailable. Check your internet connection and database setup.'
  };
  return messages[error.code] || error.message || 'Something went wrong. Please try again.';
}

return { hasConfig, connect, getUser, watchUser, register, login, logout, resetPassword, getQuizzes, getQuestions, publishQuiz, deleteQuiz, getResults, saveResult, errorMessage };
})();
