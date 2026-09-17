
// Sample quizzes can be tried before Firebase is connected.
const sampleQuizzes = [
  {
    id: 'sample-html', title: 'HTML & CSS Basics', description: 'A short check of your web development basics.', author: 'Sample quiz', ownerId: null,
    questions: [
      { text: 'Which language creates the structure of a web page?', options: ['CSS', 'HTML', 'Python', 'SQL'], correct: 1 },
      { text: 'Which CSS property changes the text colour?', options: ['margin', 'padding', 'color', 'width'], correct: 2 },
      { text: 'Which HTML tag creates a link?', options: ['<a>', '<p>', '<h1>', '<div>'], correct: 0 }
    ]
  },
  {
    id: 'sample-maths', title: 'Everyday Numbers', description: 'Warm up with three simple maths questions.', author: 'Sample quiz', ownerId: null,
    questions: [
      { text: 'What is 7 × 6?', options: ['36', '40', '42', '48'], correct: 2 },
      { text: 'What is 25% of 100?', options: ['10', '20', '50', '25'], correct: 3 },
      { text: 'What is 18 ÷ 3?', options: ['3', '6', '9', '12'], correct: 1 }
    ]
  }
];
let data = { user: null, quizzes: sampleQuizzes.slice(), results: [] };
let firebaseReady = false;
let currentPage = 'home';
let firebaseProblem = 'Firebase is not connected. Complete the setup instructions in README.md.';
let authBusy = false;

// These variables remember the draft and the current quiz attempt.
let draftQuestions = [];
let activeQuiz = null;
let questionNumber = 0;
let answers = [];
let answerChecked = false;
let attemptUserId = null;
let attemptKey = '';
const letters = ['A', 'B', 'C', 'D'];
const notice = document.getElementById('notice');
const questionForm = document.getElementById('question-form');

// Make a text element. textContent keeps user text separate from HTML.
function addText(parent, tag, text, className = '') {
  const element = document.createElement(tag);
  element.textContent = text;
  element.className = className;
  parent.appendChild(element);
  return element;
}

function showNotice(text) {
  notice.textContent = text;
  notice.hidden = false;
}

// Do not wait forever when a read or connection is blocked.
async function withTimeout(task) {
  let timer;
  try {
    return await Promise.race([
      task,
      new Promise(function (resolve, reject) {
        timer = setTimeout(function () {
          reject(new Error('Firebase is taking too long. Check your internet connection and Firebase setup. Sample quizzes are still available.'));
        }, 15000);
      })
    ]);
  } finally {
    clearTimeout(timer);
  }
}

// Fetch fresh data without stopping page navigation.
async function loadData() {
  if (!firebaseReady) return;
  const user = firebase.getUser();
  const replies = await withTimeout(Promise.all([firebase.getQuizzes(), firebase.getResults()]));
  const latestUser = firebase.getUser();
  if ((user ? user.id : null) !== (latestUser ? latestUser.id : null)) return;
  data = { user: user, quizzes: sampleQuizzes.concat(replies[0]), results: replies[1] };
}

function getUser() {
  return data.user;
}

function refreshCurrentPage() {
  updateHeader();
  if (currentPage === 'home') showHome();
  if (currentPage === 'quizzes') showQuizList();
}

async function openPage(name) {
  // Respond to the click first, then refresh cloud data in the background.
  showPage(name);
  if (!firebaseReady) {
    if (currentPage === 'account') showNotice(firebaseProblem);
    return;
  }
  try {
    await loadData();
    refreshCurrentPage();
  } catch (error) {
    showNotice(firebase.errorMessage(error));
  }
}

function getQuiz(id) {
  for (const quiz of data.quizzes) {
    if (quiz.id === id) return quiz;
  }
  return null;
}

// Show one page and hide the others.
function showPage(name) {
  if (name === 'create' && getUser() === null) {
    showPage('account');
    showNotice(firebaseReady ? 'Create an account or log in before making a quiz.' : firebaseProblem);
    return;
  }
  currentPage = name;
  for (const page of document.querySelectorAll('.page')) page.hidden = true;
  document.getElementById(name + '-page').hidden = false;
  notice.hidden = true;
  for (const button of document.querySelectorAll('.nav-button')) {
    button.classList.toggle('active', button.dataset.page === name);
  }
  updateHeader();
  if (name === 'home') showHome();
  if (name === 'quizzes') showQuizList();
  window.scrollTo(0, 0);
}

function updateHeader() {
  const user = getUser();
  document.getElementById('account-button').textContent = user ? user.name : 'Log in / Register';
  document.getElementById('logout-button').hidden = user === null;
}

function showHome() {
  const user = getUser();
  const list = document.getElementById('recent-list');
  const empty = document.getElementById('recent-empty');
  list.replaceChildren();
  empty.hidden = false;
  if (user === null) {
    document.getElementById('welcome-name').textContent = 'Welcome! Make a quiz or try one from the collection.';
    empty.textContent = 'Log in before taking a quiz to save your scores.';
    return;
  }
  document.getElementById('welcome-name').textContent = 'Welcome, ' + user.name + '! What would you like to practise today?';
  empty.textContent = 'No scores yet. Take a quiz to get started.';
  let shown = 0;
  for (const result of data.results) {
    if (shown < 5) {
      addText(list, 'li', result.title + ' — ' + result.score + '/' + result.total + ' · ' + result.date);
      shown++;
      empty.hidden = true;
    }
  }
}

// Register using a display name, email, and password.
document.getElementById('register-form').addEventListener('submit', async function (event) {
  event.preventDefault();
  if (!firebaseReady) return showNotice(firebaseProblem);
  const form = event.currentTarget;
  const name = document.getElementById('register-name').value.trim();
  if (name.length < 2) return showNotice('Enter a display name with at least two characters.');
  const password = document.getElementById('register-password').value;
  if (password !== document.getElementById('confirm-password').value) return showNotice('The passwords do not match.');
  if (draftQuestions.length > 0 && !confirm('Changing accounts clears your unpublished draft. Continue?')) return;
  const button = form.querySelector('button');
  button.disabled = true;
  button.textContent = 'Creating account...';
  authBusy = true;
  try {
    await firebase.register(name, document.getElementById('register-email').value.trim(), password);
    form.reset();
    await loadData();
    clearDraft();
    showPage('home');
    showNotice('Your account is ready. You are logged in.');
  } catch (error) {
    showNotice(firebase.errorMessage(error));
  } finally {
    authBusy = false;
    button.disabled = false;
    button.textContent = 'Create account';
  }
});

// Firebase checks the email and password.
document.getElementById('login-form').addEventListener('submit', async function (event) {
  event.preventDefault();
  if (!firebaseReady) return showNotice(firebaseProblem);
  const form = event.currentTarget;
  if (draftQuestions.length > 0 && !confirm('Changing accounts clears your unpublished draft. Continue?')) return;
  const button = form.querySelector('button');
  button.disabled = true;
  button.textContent = 'Logging in...';
  authBusy = true;
  try {
    await firebase.login(document.getElementById('login-email').value.trim(), document.getElementById('login-password').value);
    form.reset();
    await loadData();
    clearDraft();
    showPage('home');
    showNotice('You are logged in.');
  } catch (error) {
    showNotice(firebase.errorMessage(error));
  } finally {
    authBusy = false;
    button.disabled = false;
    button.textContent = 'Log in';
  }
});

document.getElementById('logout-button').addEventListener('click', async function () {
  if (draftQuestions.length > 0 && !confirm('Logging out clears your unpublished draft. Continue?')) return;
  authBusy = true;
  try {
    await firebase.logout();
    await loadData();
    clearDraft();
    showPage('home');
    showNotice('You are logged out.');
  } catch (error) {
    showNotice(firebase.errorMessage(error));
  } finally {
    authBusy = false;
  }
});

// Firebase can send a password-reset email without a custom backend.
document.getElementById('reset-password').addEventListener('click', async function () {
  if (!firebaseReady) return;
  const email = document.getElementById('login-email');
  if (!email.reportValidity()) return;
  const button = document.getElementById('reset-password');
  button.disabled = true;
  try {
    await firebase.resetPassword(email.value.trim());
    showNotice('If this address has an account, a reset email will be sent. Check your inbox and spam folder.');
  } catch (error) {
    showNotice(firebase.errorMessage(error));
  } finally {
    button.disabled = false;
  }
});

// Display the available quizzes.
function showQuizList() {
  const list = document.getElementById('quiz-list');
  list.replaceChildren();
  const user = getUser();
  for (const quiz of data.quizzes) {
    const card = addText(list, 'article', '', 'card quiz-card');
    addText(card, 'p', (quiz.questions ? quiz.questions.length : quiz.questionCount) + ' QUESTIONS', 'label');
    addText(card, 'h2', quiz.title);
    addText(card, 'p', quiz.description || 'A quiz made on Online Quiz Maker.');
    addText(card, 'p', 'Created by ' + quiz.author, 'quiz-meta');
    const actions = addText(card, 'div', '', 'quiz-actions');
    const takeButton = addText(actions, 'button', 'Take quiz →', 'button');
    takeButton.addEventListener('click', async function () {
      takeButton.disabled = true;
      await startQuiz(quiz.id);
      takeButton.disabled = false;
    });
    if (user && quiz.ownerId === user.id) {
      const deleteButton = addText(actions, 'button', 'Delete', 'text-button');
      deleteButton.addEventListener('click', async function () {
        if (!confirm('Delete this quiz from Firebase?')) return;
        try {
          await firebase.deleteQuiz(quiz.id);
          await loadData();
          showQuizList();
          showNotice('Quiz deleted. Previous scores are kept.');
        } catch (error) {
          showNotice(firebase.errorMessage(error));
        }
      });
    }
  }
}

// Add a question to the draft.
questionForm.addEventListener('submit', function (event) {
  event.preventDefault();
  if (draftQuestions.length >= 20) return showNotice('A quiz can have up to 20 questions.');
  const text = document.getElementById('question-text').value.trim();
  const options = [];
  for (const id of ['option-a', 'option-b', 'option-c', 'option-d']) {
    options.push(document.getElementById(id).value.trim());
  }
  if (text === '' || options.includes('')) return showNotice('Fill in the question and all four options.');
  // Each option should be different.
  for (let i = 0; i < options.length; i++) {
    for (let j = i + 1; j < options.length; j++) {
      if (options[i].toLowerCase() === options[j].toLowerCase()) return showNotice('Please use four different options.');
    }
  }
  const correct = Number(document.getElementById('correct-answer').value);
  draftQuestions.push({ text: text, options: options, correct: correct });
  questionForm.reset();
  showDraft();
  showNotice('Question added. Add another, or publish your quiz.');
});

function showDraft() {
  const list = document.getElementById('draft-list');
  list.replaceChildren();
  document.getElementById('draft-count').textContent = draftQuestions.length;
  document.getElementById('draft-empty').hidden = draftQuestions.length > 0;
  for (const question of draftQuestions) {
    const item = addText(list, 'li', '');
    addText(item, 'strong', question.text);
    for (let i = 0; i < 4; i++) addText(item, 'p', letters[i] + '. ' + question.options[i]);
    addText(item, 'p', 'Correct answer: ' + letters[question.correct]);
    const remove = addText(item, 'button', 'Remove question', 'text-button');
    remove.addEventListener('click', function () {
      draftQuestions.splice(draftQuestions.indexOf(question), 1);
      showDraft();
    });
  }
}

function clearDraft() {
  draftQuestions = [];
  document.getElementById('quiz-title').value = '';
  document.getElementById('quiz-description').value = '';
  questionForm.reset();
  showDraft();
}

document.getElementById('clear-draft').addEventListener('click', function () {
  if (confirm('Clear the title and all unpublished questions?')) clearDraft();
});

document.getElementById('publish-button').addEventListener('click', async function () {
  const user = getUser();
  if (user === null) return showPage('account');
  const titleInput = document.getElementById('quiz-title');
  if (!titleInput.reportValidity()) return;
  const title = titleInput.value.trim();
  if (title === '') return showNotice('Please enter a quiz title.');
  if (draftQuestions.length === 0) return showNotice('Add at least one question before publishing.');
  for (const field of questionForm.querySelectorAll('input, textarea, select')) {
    if (field.value !== '') return showNotice('You have an unfinished question. Click Add question, or empty those fields before publishing.');
  }
  const button = document.getElementById('publish-button');
  button.disabled = true;
  try {
    await firebase.publishQuiz(title, document.getElementById('quiz-description').value.trim(), draftQuestions);
    clearDraft();
    await loadData();
    showPage('quizzes');
    showNotice('Quiz published to Firebase. Other users of this project can take it.');
  } catch (error) {
    showNotice(firebase.errorMessage(error));
  } finally {
    button.disabled = false;
  }
});

// Start a new quiz attempt.
async function startQuiz(id) {
  const quiz = getQuiz(id);
  if (!quiz) return;
  const startingPage = currentPage;
  try {
    if (!quiz.questions) {
      const questions = await withTimeout(firebase.getQuestions(id));
      if (questions.length !== quiz.questionCount) throw new Error('This quiz has missing questions. Please choose another quiz.');
      quiz.questions = questions;
    }
  } catch (error) {
    showNotice(firebase.errorMessage(error));
    return;
  }
  if (currentPage !== startingPage) return;
  activeQuiz = quiz;
  const user = getUser();
  attemptUserId = user ? user.id : null;
  questionNumber = 0;
  answers = [];
  attemptKey = Date.now() + '-' + Math.random();
  document.getElementById('take-title').textContent = activeQuiz.title;
  showPage('take');
  showQuestion();
}

function showQuestion() {
  const question = activeQuiz.questions[questionNumber];
  const options = document.getElementById('answer-options');
  options.replaceChildren();
  answerChecked = false;
  document.getElementById('question-title').textContent = question.text;
  document.getElementById('progress-text').textContent = 'Question ' + (questionNumber + 1) + ' of ' + activeQuiz.questions.length;
  document.getElementById('quiz-progress').max = activeQuiz.questions.length;
  document.getElementById('quiz-progress').value = questionNumber;
  document.getElementById('answer-feedback').hidden = true;
  document.getElementById('check-button').hidden = false;
  document.getElementById('next-button').hidden = true;
  for (let i = 0; i < question.options.length; i++) {
    const label = addText(options, 'label', '', 'answer-option');
    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = 'answer';
    radio.value = i;
    radio.required = true;
    label.appendChild(radio);
    addText(label, 'span', letters[i] + '. ' + question.options[i]);
  }
}

// Check the selected answer and give immediate feedback.
document.getElementById('answer-form').addEventListener('submit', function (event) {
  event.preventDefault();
  if (answerChecked) return;
  const selected = document.querySelector('input[name="answer"]:checked');
  if (!selected) return;
  const choice = Number(selected.value);
  const question = activeQuiz.questions[questionNumber];
  answers.push(choice);
  answerChecked = true;
  for (const radio of document.querySelectorAll('input[name="answer"]')) {
    radio.disabled = true;
    if (Number(radio.value) === question.correct) radio.parentElement.classList.add('correct');
    else if (radio.checked) radio.parentElement.classList.add('incorrect');
  }
  const feedback = document.getElementById('answer-feedback');
  feedback.hidden = false;
  if (choice === question.correct) {
    feedback.textContent = 'Correct! ' + question.options[question.correct];
    feedback.className = 'correct';
  } else {
    feedback.textContent = 'Not quite. Correct answer: ' + letters[question.correct] + '. ' + question.options[question.correct];
    feedback.className = 'incorrect';
  }
  document.getElementById('quiz-progress').value = questionNumber + 1;
  document.getElementById('check-button').hidden = true;
  const next = document.getElementById('next-button');
  next.hidden = false;
  next.textContent = questionNumber === activeQuiz.questions.length - 1 ? 'See results →' : 'Next question →';
});

document.getElementById('next-button').addEventListener('click', function () {
  if (!answerChecked) return;
  answerChecked = false;
  questionNumber++;
  if (questionNumber < activeQuiz.questions.length) showQuestion();
  else showResults();
});

// Count the score and show every correct answer.
async function showResults() {
  let score = 0;
  const review = document.getElementById('answer-review');
  review.replaceChildren();
  for (let i = 0; i < activeQuiz.questions.length; i++) {
    const question = activeQuiz.questions[i];
    const correct = answers[i] === question.correct;
    if (correct) score++;
    const card = addText(review, 'article', '', 'card review-card');
    card.classList.add(correct ? 'correct-review' : 'wrong-review');
    addText(card, 'h3', (i + 1) + '. ' + question.text);
    addText(card, 'p', 'Your answer: ' + question.options[answers[i]] + (correct ? ' — Correct' : ' — Incorrect'));
    addText(card, 'p', 'Correct answer: ' + question.options[question.correct]);
  }
  const total = activeQuiz.questions.length;
  const percentage = Math.round(score / total * 100);
  document.getElementById('result-title').textContent = activeQuiz.title;
  document.getElementById('score-number').textContent = score + ' / ' + total;
  document.getElementById('score-description').textContent = percentage + '% — ' + (score === total ? 'Perfect score. Well done!' : 'Keep practising. Every attempt helps!');
  const saveNote = document.getElementById('save-note');
  saveNote.textContent = attemptUserId === null ? 'Guest attempt. Log in before starting to save future scores.' : 'Saving your score...';
  showPage('results');
  if (attemptUserId !== null) {
    try {
      await firebase.saveResult(activeQuiz, score, attemptUserId, attemptKey);
      await loadData();
      saveNote.textContent = 'Your score is saved in your account.';
    } catch (error) {
      saveNote.textContent = 'Your score was not saved. ' + firebase.errorMessage(error);
    }
  }
}

// Connect the page buttons.
for (const button of document.querySelectorAll('[data-page]')) {
  button.addEventListener('click', function () { openPage(button.dataset.page); });
}
document.getElementById('account-button').addEventListener('click', function () { openPage('account'); });
document.getElementById('retry-button').addEventListener('click', function () { startQuiz(activeQuiz.id); });
// Connect only after the Firebase configuration has been filled in.
async function startApp() {
  showPage('home');
  const banner = document.getElementById('connection-banner');
  if (location.protocol === 'file:') {
    firebaseProblem = 'You opened index.html directly. Sample quizzes work here. For Firebase login, use VS Code → Open with Live Server and complete the Firebase setup.';
    banner.textContent = firebaseProblem;
    return;
  }
  if (typeof firebase === 'undefined') {
    firebaseProblem = 'firebase.js is missing. Extract all project files into the same folder.';
    banner.textContent = firebaseProblem;
    return;
  }
  if (!firebase.hasConfig()) {
    banner.textContent = 'Firebase setup needed. Sample quizzes and navigation work. Fill in firebase-config.js and follow README.md to enable real accounts.';
    return;
  }
  banner.textContent = 'Connecting to Firebase... You can use the sample quizzes while it connects.';
  try {
    await withTimeout(firebase.connect());
    firebaseReady = true;
    await loadData();
    for (const id of ['register-submit', 'login-submit', 'reset-password']) document.getElementById(id).disabled = false;
    document.getElementById('setup-panel').hidden = true;
    banner.textContent = 'Firebase connected. Quizzes are shared through this project. Saved scores are private to your account.';
    refreshCurrentPage();

    // Update account information when Firebase changes the signed-in user.
    let previousUserId = data.user ? data.user.id : null;
    firebase.watchUser(async function () {
      const user = firebase.getUser();
      const userId = user ? user.id : null;
      if (userId === previousUserId) return;
      previousUserId = userId;
      if (authBusy) return;
      clearDraft();
      data.user = user;
      data.results = [];
      showPage('home');
      try {
        await loadData();
        refreshCurrentPage();
      } catch (error) {
        showNotice(firebase.errorMessage(error));
      }
    });
  } catch (error) {
    firebaseReady = false;
    data = { user: null, quizzes: sampleQuizzes.slice(), results: [] };
    firebaseProblem = firebase.errorMessage(error);
    banner.textContent = 'Firebase could not connect. Navigation and sample quizzes still work. ' + firebaseProblem;
    refreshCurrentPage();
    showNotice(firebaseProblem);
  }
}
startApp();
