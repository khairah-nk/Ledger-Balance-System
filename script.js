
// Issue # The comment at the top was wrongly formatted
/* Ledger Balance System */


// Issue Browsers do not natively support CommonJS require().

import User from './user.js';


// Issue # Logic error, It should be firstName and lastName. 
//const person = new User("Bin Rashid", "Muhamad Abu Bakar");
const person = new User("Muhamad Abu Bakar","Bin Rashid");

const greeting = document.getElementById("greeting");

// Issue # fullname returns a string, and strings don’t have a .lastName property, so this prints “undefined”.
//greeting.textContent = `Welcome, ${person.fullname?.lastName}!`;
greeting.textContent = `Welcome, ${person.fullname}!`;
console.log(`Welcome, ${person.fullname}!`);

const expenses = ["food", "rent", "others", "saving"];

function calculate() {
  const salary = Number(document.getElementById("salary").value) || 0;

  let total = 0;
  for (let i = 0; i < expenses.length; i++) {
    const val = Number(document.getElementById(expenses[i]).value) || 0;
    total += val;
  }

  const balance = salary - total;
  const percent = (balance / salary) * 100;

  const result = document.getElementById("result");
  result.textContent = `Net Balance: $${balance} (${
    percent.toFixed(1) + '%'
  } of income)`;

  // change the background color based on the balance
//   result.style.backgroundColor = balance >= 0 ? "#d4edda" : "#f8d7da";
//   result.style.color = balance >= 0 ? "#155724" : "#721c24";
if (salary <= 0) {
  result.textContent = "Please enter a salary greater than 0.";
  result.className = "result error";
  return;
}

result.className = balance >= 0 ? "result positive" : "result negative";
}


document.getElementById("calculate").addEventListener("click", calculate);
