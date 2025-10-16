// ABOUTME: Core JavaScript functionality for the cashbook PWA
// ABOUTME: Handles transactions, storage, UI interactions, and data management

class CashBook {
    constructor() {
        this.transactions = this.loadTransactions();
        this.categories = {
            income: ['Salary', 'Freelance', 'Business', 'Investment', 'Gift', 'Other Income'],
            expense: ['Food', 'Travel', 'Bills', 'Shopping', 'Entertainment', 'Healthcare', 'Education', 'Rent', 'Investment', 'EMI', 'Grocery', 'Household', 'Personal', 'Other Expense']
        };
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.populateCategories();
        this.setDefaultDate();
        this.updateUI();
        this.showTab('transactions');
    }

    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.showTab(e.target.dataset.tab);
            });
        });

        // Transaction form
        document.getElementById('transactionForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTransaction();
        });

        // Type change updates categories
        document.getElementById('type').addEventListener('change', (e) => {
            this.updateCategoryOptions(e.target.value);
        });

        // Filters
        document.getElementById('categoryFilter').addEventListener('change', () => {
            this.renderTransactions();
        });

        document.getElementById('typeFilter').addEventListener('change', () => {
            this.renderTransactions();
        });

        // Export and clear data
        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportToCSV();
        });

        document.getElementById('clearDataBtn').addEventListener('click', () => {
            this.clearAllData();
        });
    }

    showTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `${tabName}-tab`);
        });

        // Update UI when showing specific tabs
        if (tabName === 'transactions') {
            this.renderTransactions();
        } else if (tabName === 'reports') {
            this.updateReports();
        }
    }

    populateCategories() {
        const categorySelect = document.getElementById('category');
        const categoryFilter = document.getElementById('categoryFilter');

        // Clear existing options (except first one)
        categorySelect.innerHTML = '<option value="">Select Category</option>';
        categoryFilter.innerHTML = '<option value="">All Categories</option>';

        // Add all categories to filter
        [...this.categories.income, ...this.categories.expense].forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        });
    }

    updateCategoryOptions(type) {
        const categorySelect = document.getElementById('category');
        categorySelect.innerHTML = '<option value="">Select Category</option>';

        if (type && this.categories[type]) {
            this.categories[type].forEach(category => {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category;
                categorySelect.appendChild(option);
            });
        }
    }

    setDefaultDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('date').value = today;
    }

    addTransaction() {
        const transaction = {
            id: this.editingTransactionId || Date.now().toString(),
            amount: parseFloat(document.getElementById('amount').value),
            type: document.getElementById('type').value,
            category: document.getElementById('category').value,
            paymentMode: document.getElementById('paymentMode').value,
            description: document.getElementById('description').value || '',
            date: document.getElementById('date').value,
            timestamp: new Date().toISOString()
        };

        if (this.editingTransactionId) {
            // Update existing transaction
            const index = this.transactions.findIndex(t => t.id === this.editingTransactionId);
            if (index !== -1) {
                this.transactions[index] = transaction;
                this.showMessage('Transaction updated successfully!', 'success');
            } else {
                this.showMessage('Error updating transaction!', 'error');
                return;
            }
            // Clear editing mode
            this.editingTransactionId = null;
        } else {
            // Add new transaction
            this.transactions.push(transaction);
            this.showMessage('Transaction added successfully!', 'success');
        }

        this.saveTransactions();
        this.updateUI();
        this.resetForm();
        this.showTab('transactions');
    }

    editTransaction(transactionId) {
        const transaction = this.transactions.find(t => t.id === transactionId);
        if (!transaction) {
            this.showMessage('Transaction not found!', 'error');
            return;
        }

        // Populate form with transaction data
        document.getElementById('amount').value = transaction.amount;
        document.getElementById('type').value = transaction.type;
        this.updateCategoryOptions(transaction.type);

        // Wait for categories to populate, then set category
        setTimeout(() => {
            document.getElementById('category').value = transaction.category;
        }, 50);

        document.getElementById('paymentMode').value = transaction.paymentMode;
        document.getElementById('description').value = transaction.description;
        document.getElementById('date').value = transaction.date;

        // Store the ID being edited
        this.editingTransactionId = transactionId;

        // Update the form button
        const submitBtn = document.querySelector('#transactionForm button[type="submit"]');
        submitBtn.textContent = 'Update Transaction';
        submitBtn.className = 'btn-secondary';

        // Switch to Add tab
        this.showTab('add');
        this.showMessage('Edit mode: Update the transaction and submit', 'info');
    }

    deleteTransaction(transactionId) {
        if (!confirm('Are you sure you want to delete this transaction? This action cannot be undone.')) {
            return;
        }

        const index = this.transactions.findIndex(t => t.id === transactionId);
        if (index === -1) {
            this.showMessage('Transaction not found!', 'error');
            return;
        }

        this.transactions.splice(index, 1);
        this.saveTransactions();
        this.updateUI();
        this.showMessage('Transaction deleted successfully!', 'success');
    }

    resetForm() {
        document.getElementById('transactionForm').reset();
        this.setDefaultDate();
        document.getElementById('category').innerHTML = '<option value="">Select Category</option>';

        // Reset edit mode
        this.editingTransactionId = null;
        const submitBtn = document.querySelector('#transactionForm button[type="submit"]');
        submitBtn.textContent = 'Add Transaction';
        submitBtn.className = 'btn-primary';
    }

    loadTransactions() {
        const stored = localStorage.getItem('cashbook_transactions');
        return stored ? JSON.parse(stored) : [];
    }

    saveTransactions() {
        localStorage.setItem('cashbook_transactions', JSON.stringify(this.transactions));
    }

    updateUI() {
        this.updateBalance();
        this.renderTransactions();
        this.updateReports();
    }

    updateBalance() {
        const total = this.calculateBalance();
        const balanceElement = document.getElementById('totalBalance');
        balanceElement.textContent = this.formatCurrency(total);
        balanceElement.className = `balance-amount ${total >= 0 ? 'positive' : 'negative'}`;
    }

    calculateBalance() {
        return this.transactions.reduce((total, transaction) => {
            return transaction.type === 'income'
                ? total + transaction.amount
                : total - transaction.amount;
        }, 0);
    }

    renderTransactions() {
        const container = document.getElementById('transactionsList');
        const categoryFilter = document.getElementById('categoryFilter').value;
        const typeFilter = document.getElementById('typeFilter').value;

        let filteredTransactions = this.transactions;


        // Apply filters
        if (categoryFilter) {
            filteredTransactions = filteredTransactions.filter(t => t.category === categoryFilter);
        }
        if (typeFilter) {
            filteredTransactions = filteredTransactions.filter(t => t.type === typeFilter);
        }

        // Sort by date (newest first)
        filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

        if (filteredTransactions.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>No transactions found matching your filters.</p>
                </div>
            `;
            return;
        }

        // Store reference to this for use in template
        const self = this;
        container.innerHTML = filteredTransactions.map(transaction => {
            const formattedAmount = self.formatCurrency(transaction.amount);
            const formattedDate = self.formatDate(transaction.date);

            return `
                <div class="transaction-item" data-id="${transaction.id}">
                    <div class="transaction-header">
                        <div>
                            <div class="transaction-amount ${transaction.type}">
                                ${transaction.type === 'income' ? '+' : '-'}${formattedAmount}
                            </div>
                            ${transaction.description ? `<div class="transaction-description">${transaction.description}</div>` : ''}
                        </div>
                        <div class="transaction-actions">
                            <div class="transaction-date">${formattedDate}</div>
                            <div class="action-buttons">
                                <button class="btn-edit" onclick="cashbook.editTransaction('${transaction.id}')">✏️</button>
                                <button class="btn-delete" onclick="cashbook.deleteTransaction('${transaction.id}')">🗑️</button>
                            </div>
                        </div>
                    </div>
                    <div class="transaction-details">
                        <span class="transaction-detail">${transaction.category}</span>
                        <span class="transaction-detail">${transaction.paymentMode}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    updateReports() {
        const totalIncome = this.transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        const totalExpenses = this.transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        const netBalance = totalIncome - totalExpenses;

        document.getElementById('totalIncome').textContent = this.formatCurrency(totalIncome);
        document.getElementById('totalExpenses').textContent = this.formatCurrency(totalExpenses);
        document.getElementById('netBalance').textContent = this.formatCurrency(netBalance);

        this.updateMonthlySummary();
    }

    updateMonthlySummary() {
        const monthlyData = {};

        this.transactions.forEach(transaction => {
            const date = new Date(transaction.date);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = { income: 0, expense: 0 };
            }

            if (transaction.type === 'income') {
                monthlyData[monthKey].income += transaction.amount;
            } else {
                monthlyData[monthKey].expense += transaction.amount;
            }
        });

        const container = document.getElementById('monthlySummary');
        const months = Object.keys(monthlyData).sort().reverse();

        if (months.length === 0) {
            container.innerHTML = '<p class="empty-state">No transactions to summarize.</p>';
            return;
        }

        container.innerHTML = months.map(month => {
            const data = monthlyData[month];
            const balance = data.income - data.expense;
            const monthName = new Date(month + '-01').toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long'
            });

            return `
                <div class="month-item">
                    <h4>${monthName}</h4>
                    <div class="month-stats">
                        <div class="month-income">Income: ${this.formatCurrency(data.income)}</div>
                        <div class="month-expense">Expense: ${this.formatCurrency(data.expense)}</div>
                        <div class="month-balance">Balance: ${this.formatCurrency(balance)}</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    exportToCSV() {
        if (this.transactions.length === 0) {
            this.showMessage('No transactions to export', 'error');
            return;
        }

        const headers = ['Date', 'Type', 'Category', 'Amount', 'Payment Mode', 'Description'];
        const csvContent = [
            headers.join(','),
            ...this.transactions.map(t => [
                t.date,
                t.type,
                t.category,
                t.amount,
                t.paymentMode,
                `"${t.description}"`
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cashbook-export-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        this.showMessage('Data exported successfully!', 'success');
    }

    clearAllData() {
        if (confirm('Are you sure you want to delete all transactions? This action cannot be undone.')) {
            this.transactions = [];
            this.saveTransactions();
            this.updateUI();
            this.showMessage('All data cleared successfully!', 'success');
        }
    }

    formatCurrency(amount) {
        // Simple Safari-compatible currency formatting
        if (typeof amount !== 'number' || isNaN(amount)) {
            return '₹0';
        }

        // Simple formatting that works everywhere
        return '₹' + amount.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    formatDate(dateString) {
        // Simple Safari-compatible date formatting
        if (!dateString) {
            return 'Invalid Date';
        }

        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return 'Invalid Date';
        }

        // Simple format that works everywhere: DD/MM/YYYY
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();

        return `${day}/${month}/${year}`;
    }

    showMessage(message, type = 'info') {
        // Create message element
        const messageEl = document.createElement('div');
        messageEl.className = `message message-${type}`;
        messageEl.textContent = message;
        messageEl.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${type === 'success' ? '#059669' : type === 'error' ? '#dc2626' : '#2563eb'};
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            z-index: 1000;
            font-size: 14px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        `;

        document.body.appendChild(messageEl);

        // Remove after 3 seconds
        setTimeout(() => {
            messageEl.remove();
        }, 3000);
    }
}

// Initialize the app when DOM is loaded
let cashbook;
document.addEventListener('DOMContentLoaded', () => {
    cashbook = new CashBook();
});

// Register service worker for PWA functionality
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}