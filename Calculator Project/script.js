// Get the display and buttons.
const display = document.getElementById('display');
const previous = document.getElementById('previous');
const message = document.getElementById('message');
const buttons = document.querySelectorAll('.key');

// Remember the number and operator.
let current = '0';
let firstNumber = 0;
let operator = '';
let newNumber = false;

// Show calculator symbols instead of * and /.
function formatOperation(text) {
  return text.replaceAll('*', '×').replaceAll('/', '÷').replaceAll('-', '−');
}

function updateDisplay() {
  let text = current;

  // Show the first number, operator, and second number together.
  if (operator !== '') {
    text = firstNumber + ' ' + operator;
    if (!newNumber) text = text + ' ' + current;
  }

  display.textContent = formatOperation(text);
  display.classList.toggle('small', text.length > 10);
  display.scrollLeft = display.scrollWidth;
}

function clearCalculator() {
  current = '0';
  firstNumber = 0;
  operator = '';
  newNumber = false;
  previous.textContent = '';
  message.textContent = '';
  updateDisplay();
}

function addDigit(value) {
  if (newNumber) {
    current = '0';
    newNumber = false;
  }
  if (operator === '') previous.textContent = '';

  // Allow only one decimal point.
  if (value === '.' && current.includes('.')) return;
  if (current.length >= 14) return;

  if (current === '0' && value !== '.') current = value;
  else if (current === '-0' && value !== '.') current = '-' + value;
  else current = current + value;
}

function calculate() {
  // Wait until both numbers have been entered.
  if (operator === '' || newNumber) return true;

  const secondNumber = Number(current);
  let answer;

  if (operator === '+') answer = firstNumber + secondNumber;
  else if (operator === '-') answer = firstNumber - secondNumber;
  else if (operator === '*') answer = firstNumber * secondNumber;
  else if (operator === '/') {
    if (secondNumber === 0) {
      clearCalculator();
      message.textContent = 'Cannot divide by zero. Try again.';
      return false;
    }
    answer = firstNumber / secondNumber;
  }

  if (!Number.isFinite(answer)) {
    clearCalculator();
    message.textContent = 'This number is too large. Try again.';
    return false;
  }

  previous.textContent = formatOperation(firstNumber + ' ' + operator + ' ' + secondNumber + ' =');
  // Remove tiny decimal errors, such as 0.1 + 0.2.
  current = String(Number(answer.toPrecision(12)));
  operator = '';
  newNumber = true;
  return true;
}

function chooseOperator(value) {
  // Finish the last operation before starting another.
  if (!calculate()) return;
  firstNumber = Number(current);
  operator = value;
  previous.textContent = '';
  newNumber = true;
}

function handleButton(value) {
  message.textContent = '';

  if (value === 'AC') clearCalculator();
  else if (value === '=') calculate();
  else if (value === '+' || value === '-' || value === '*' || value === '/') {
    chooseOperator(value);
  } else if (value === 'DEL') {
    if (!newNumber) {
      current = current.slice(0, -1);
      if (current === '' || current === '-') current = '0';
    }
  } else if (value === 'sign') {
    // Start a negative number, or change the current sign.
    if (newNumber && operator !== '') current = '0';
    if (current.startsWith('-')) current = current.slice(1);
    else current = '-' + current;
    newNumber = false;
    if (operator === '') previous.textContent = '';
  } else if (value === '%') {
    if (!(newNumber && operator !== '')) {
      current = String(Number((Number(current) / 100).toPrecision(12)));
      if (operator === '') {
        previous.textContent = '';
        newNumber = true;
      }
    }
  } else {
    addDigit(value);
  }
  updateDisplay();
}

// Add a click event to each button.
for (const button of buttons) {
  button.addEventListener('click', function () {
    handleButton(button.dataset.value);
  });
}

// Allow keyboard input too.
document.addEventListener('keydown', function (event) {
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  if (event.key === 'Enter' && event.target.id === 'help-button') return;
  let value = event.key;
  if (value === 'Enter') value = '=';
  else if (value === 'Backspace') value = 'DEL';
  else if (value === 'Escape' || value === 'Delete') value = 'AC';
  else if (!'0123456789.+-*/%='.includes(value) || value.length !== 1) return;
  event.preventDefault();
  handleButton(value);
});

// Show or hide keyboard help.
const helpButton = document.getElementById('help-button');
const helpPanel = document.getElementById('help-panel');
helpButton.addEventListener('click', function () {
  helpPanel.hidden = !helpPanel.hidden;
  helpButton.setAttribute('aria-expanded', String(!helpPanel.hidden));
});
