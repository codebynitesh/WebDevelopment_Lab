# Simple Calculator

A basic calculator made with HTML, CSS, and JavaScript.
It has blue and purple buttons and a border. There is no history feature.

## How to open
Keep all the files in one folder and open index.html in a browser.
No installation or internet connection is needed.

## Files
- index.html: the display and buttons.
- style.css: the colours, border, sizes, and grid layout.
- script.js: the button events and calculations.
- README.md: these instructions. The calculator does not need this file to run.

## How the code works
1. current stores the number on the screen as text.
2. firstNumber stores the first number.
3. operator stores +, -, *, or /.
4. newNumber tells the calculator when to start entering another number.
5. handleButton checks which button was pressed using if-else statements.
6. calculate converts the text to numbers and performs the operation.
   The main display shows the full operation while typing (for example, 3915 × 2).
   After equals, the completed calculation appears above the answer.
7. A for loop adds a click event to every calculator button.

CSS Grid arranges the buttons in four columns.
There are no libraries, expression parsers, or eval calls.

## Buttons
- AC clears the calculation.
- +/− changes the sign of a number. It replaces the old parentheses button.
- % divides the displayed number by 100.
- The backspace button deletes a digit while entering a number.
- = shows the answer.
- The three-dot button opens keyboard help.

You can also type numbers and operators. Use Enter to calculate,
Backspace to delete, and Escape to clear.

## One operation at a time
This version works step by step, not with mathematical precedence.
For example, 2 + 3 × 4 = gives 20: it first adds 2 and 3, then multiplies by 4.
There are no parentheses. Pressing another operator before entering the
second number changes the selected operator.
Pressing equals again does not repeat the previous operation.

## Tests to try
- 12 + 8 = 20
- 9 - 14 = -5
- 7 × 6 = 42
- 20 ÷ 4 = 5
- 0.1 + 0.2 = 0.3
- 200 × 10 % = 20
- 5 ÷ 0 shows an error

Results use 12 significant digits to reduce decimal rounding errors.
Percentage directly divides a number by 100; it is not a financial percentage rule.

