# Online Quiz Maker

A simple web-based quiz application where users can create quizzes, share them, and test their knowledge.

The project was built using plain **HTML, CSS and JavaScript**, with **Firebase** used for user authentication and storing quizzes and quiz results.

## What can you do with it?

- Create an account and log in
- Browse available quizzes
- Take quizzes one question at a time
- Get instant feedback after answering
- See your final score and review your answers
- Create your own quiz with up to 20 questions
- Publish quizzes so other users can take them
- Delete quizzes that you created
- Save your quiz scores to your account
- Take quizzes as a guest without creating an account
- Reset your password through Firebase

There are also a couple of sample quizzes available, so the website can be tested even before Firebase is connected.

## Tech Stack

- **HTML** – Page structure
- **CSS** – Styling and responsive layout
- **JavaScript** – Application logic and quiz functionality
- **Firebase Authentication** – Login, registration and password reset
- **Firebase Firestore** – Quiz and result storage

The frontend is kept framework-free. There is no React, Bootstrap or other frontend framework involved.

## Project Structure

```text
Online-Quiz-Maker/
│
├── index.html
├── style.css
├── script.js
├── firebase.js
├── firebase-config.js
├── firestore.rules
└── README.md
```

### `index.html`

Contains the main structure of the application, including the home page, quiz list, account page, quiz creation form, quiz-taking page and results page.

### `style.css`

Contains the styling for the website, including the layout, buttons, forms, quiz cards, answer states, results page and mobile responsiveness.

### `script.js`

Handles most of the application's functionality, such as navigation, creating quizzes, taking quizzes, checking answers, calculating scores and displaying results.

### `firebase.js`

Acts as the connection between the application and Firebase. It handles authentication, Firestore operations, publishing/deleting quizzes and saving user results.

### `firebase-config.js`

Contains the Firebase web app configuration required to connect the website to the Firebase project.

### `firestore.rules`

Contains the Firestore security rules used to control access to the database.

---

## Running the Project

### 1. Download or clone the project

Clone the repository:

```bash
git clone <your-repository-url>
```

Or simply download the project and extract it.

### 2. Open the project in VS Code

Open the project folder in **Visual Studio Code**.

### 3. Set up Firebase

Create a Firebase project and register a web application.

In Firebase, enable:

- Email/Password Authentication
- Cloud Firestore

Then add your Firebase web configuration to:

```text
firebase-config.js
```

### 4. Add the Firestore rules

Publish the rules provided in:

```text
firestore.rules
```

These rules are important because the application stores published quizzes and user-specific results in Firestore.

### 5. Run the website

For the Firebase features to work properly, open the project using **VS Code Live Server** instead of opening `index.html` directly.

In VS Code:

```text
Right click index.html
        ↓
Open with Live Server
```

The sample quizzes can also be opened directly without connecting Firebase.

---

## How the Application Works

### Taking a Quiz

Users can browse the available quizzes and select **Take quiz**.

Each question is displayed separately with four options. After selecting an answer, the application immediately shows whether the answer was correct and highlights the correct option.

After completing all questions, the application calculates the score and displays:

- Score
- Percentage
- Answer review
- Correct answers
- User's selected answers

### Creating a Quiz

A logged-in user can create a quiz by entering a title and optional description.

Each question contains:

- Question text
- Option A
- Option B
- Option C
- Option D
- Correct answer

A quiz can contain a maximum of **20 questions**.

Once finished, the quiz can be published to Firebase.

### Accounts

Firebase Authentication is used for:

- Account registration
- Login
- Logout
- Password reset

The application uses the user's display name when showing their account information. The email address is not displayed on quiz cards.

### Saving Results

Logged-in users can have their quiz results saved to their account.

Results are stored under the user's own Firestore area rather than being placed in a public results collection.

---

## Guest Mode

You don't have to create an account just to try the application.

Sample quizzes can be taken without Firebase, and guest attempts can be completed normally. However, logging in is required for features such as publishing quizzes and saving scores.

---

## Sample Quizzes

The project includes sample quizzes for testing:

- **HTML & CSS Basics**
- **Everyday Numbers**

This makes it possible to try the main quiz functionality before setting up Firebase.

---

## Firebase Database

The project uses Cloud Firestore to store quizzes and their questions.

The basic structure is:

```text
quizzes
│
├── quiz ID
│   ├── title
│   ├── description
│   ├── author
│   ├── ownerId
│   ├── questionCount
│   └── questions
│
└── ...

users
│
└── user ID
    └── results
        ├── quizId
        ├── title
        ├── score
        ├── total
        └── createdAt
```

Quiz questions are stored as a subcollection under each quiz, while results are stored under the corresponding user's account.

---

## A Few Things to Keep in Mind

- Firebase must be configured before account and cloud features can be used.
- The website can still be explored using the built-in sample quizzes without Firebase.
- Unpublished quiz drafts are kept only while working on the current session and are cleared when the account changes or the user logs out.
- Quiz creation requires a logged-in account.
- A maximum of 20 questions can be added to a quiz.
- Firebase uses browser session persistence for the current login session.

## Future Improvements

Some features that could be added later:

- Quiz categories and search
- Difficulty levels
- Timed quizzes
- Leaderboards
- More detailed user statistics
- Editing an already published quiz
- Randomized questions and options
- Better quiz sharing
- Improved admin controls

## Author

Made as a web development project to practise frontend development, JavaScript, Firebase Authentication and Firestore.

---

**Built with HTML, CSS, JavaScript & Firebase.**
