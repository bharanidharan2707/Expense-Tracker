
const form = document.getElementById("transaction-form");
const descriptionInput = document.getElementById("description");
const amountInput = document.getElementById("amount");
const typeInput = document.getElementById("type");

const balanceElement = document.getElementById("balance");
const incomeElement = document.getElementById("income");
const expensesElement = document.getElementById("expenses");
const transactionList = document.getElementById("transaction-list");

// Load saved transactions from the browser
let transactions = [];

try {
    const savedTransactions = JSON.parse(
        localStorage.getItem("transactions") || "[]"
    );

    if (Array.isArray(savedTransactions)) {
        transactions = savedTransactions.filter(item =>
            item &&
            typeof item.id === "string" &&
            typeof item.description === "string" &&
            Number.isFinite(item.amount) &&
            item.amount > 0 &&
            (item.type === "income" || item.type === "expense") &&
            typeof item.date === "string"
        );
    }
} catch (error) {
    transactions = [];
}

// Format amounts as Indian Rupees
function formatMoney(amount) {
    return amount.toLocaleString("en-IN", {
        style: "currency",
        currency: "INR"
    });
}

// Save transactions to browser storage
function saveTransactions() {
    try {
        localStorage.setItem(
            "transactions",
            JSON.stringify(transactions)
        );
    } catch (error) {
        alert("Unable to save data in this browser.");
    }
}

// Update balance, income, and expenses
function updateSummary() {
    const income = transactions
        .filter(item => item.type === "income")
        .reduce((total, item) => total + item.amount, 0);

    const expenses = transactions
        .filter(item => item.type === "expense")
        .reduce((total, item) => total + item.amount, 0);

    const balance = income - expenses;

    balanceElement.textContent = formatMoney(balance);
    incomeElement.textContent = formatMoney(income);
    expensesElement.textContent = formatMoney(expenses);
}

// Display transaction history
function displayTransactions() {
    transactionList.innerHTML = "";

    if (transactions.length === 0) {
        const emptyMessage = document.createElement("li");
        emptyMessage.className = "empty-message";
        emptyMessage.textContent = "No transactions yet.";
        transactionList.appendChild(emptyMessage);
        return;
    }

    transactions.forEach(item => {
        const listItem = document.createElement("li");
        listItem.className = "transaction";

        const info = document.createElement("div");
        info.className = "transaction-info";

        const title = document.createElement("strong");
        title.textContent = item.description;

        const date = document.createElement("small");
        date.textContent = item.date;

        info.appendChild(title);
        info.appendChild(date);

        const right = document.createElement("div");
        right.className = "transaction-right";

        const amount = document.createElement("span");
        amount.className = "transaction-amount";

        if (item.type === "income") {
            amount.classList.add("income-text");
            amount.textContent = "+ " + formatMoney(item.amount);
        } else {
            amount.classList.add("expense-text");
            amount.textContent = "- " + formatMoney(item.amount);
        }

        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-btn";
        deleteButton.textContent = "Delete";
        deleteButton.setAttribute(
            "aria-label",
            "Delete " + item.description
        );

        deleteButton.addEventListener("click", () => {
            deleteTransaction(item.id);
        });

        right.appendChild(amount);
        right.appendChild(deleteButton);

        listItem.appendChild(info);
        listItem.appendChild(right);

        transactionList.appendChild(listItem);
    });
}

// Add a new transaction
form.addEventListener("submit", function (event) {
    event.preventDefault();

    const description = descriptionInput.value.trim();
    const amount = Number(amountInput.value);
    const type = typeInput.value;

    if (
        description === "" ||
        !Number.isFinite(amount) ||
        amount <= 0 ||
        (type !== "income" && type !== "expense")
    ) {
        alert("Please enter a valid description and amount.");
        return;
    }

    const transaction = {
        id: crypto.randomUUID(),
        description: description,
        amount: amount,
        type: type,
        date: new Date().toLocaleDateString("en-IN")
    };

    transactions.unshift(transaction);

    saveTransactions();
    updateSummary();
    displayTransactions();

    form.reset();
    descriptionInput.focus();
});

// Delete a transaction
function deleteTransaction(id) {
    transactions = transactions.filter(item => item.id !== id);

    saveTransactions();
    updateSummary();
    displayTransactions();
}

// Initialize the application
updateSummary();
displayTransactions();
