// ABOUTME: Core JavaScript functionality for the cashbook PWA
// ABOUTME: Handles transactions, storage, UI interactions, and data management

class CashBook {
    constructor() {
        this.transactions = this.loadTransactions();
        this.categories = {
            income: ['Salary', 'Freelance', 'Business', 'Investment', 'Gift', 'Other Income'],
            expense: ['Food', 'Fuel', 'Travel', 'Bills', 'Shopping', 'Entertainment', 'Healthcare', 'Education', 'Rent', 'Investment', 'EMI', 'Grocery', 'Household', 'Personal', 'Other Expense']
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

        document.getElementById('paymentModeFilter').addEventListener('change', () => {
            this.renderTransactions();
        });

        document.getElementById('descriptionFilter').addEventListener('input', () => {
            this.renderTransactions();
        });

        document.getElementById('dateRangeFilter').addEventListener('change', (e) => {
            const customContainer = document.getElementById('dateRangeCustom');
            if (e.target.value === 'custom') {
                customContainer.classList.add('visible');
                const today = new Date();
                const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
                document.getElementById('dateTo').value = today.toISOString().split('T')[0];
                document.getElementById('dateFrom').value = monthAgo.toISOString().split('T')[0];
            } else {
                customContainer.classList.remove('visible');
            }
            this.renderTransactions();
        });

        document.getElementById('dateFrom').addEventListener('change', () => {
            this.renderTransactions();
        });

        document.getElementById('dateTo').addEventListener('change', () => {
            this.renderTransactions();
        });

        // Export, import, and clear data
        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportToCSV();
        });

        document.getElementById('importFile').addEventListener('change', (e) => {
            this.importFromCSV(e.target.files[0]);
            e.target.value = '';
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
        const paymentModeFilter = document.getElementById('paymentModeFilter').value;
        const descriptionFilter = document.getElementById('descriptionFilter').value.toLowerCase().trim();

        let filteredTransactions = this.transactions;

        // Apply filters
        if (categoryFilter) {
            filteredTransactions = filteredTransactions.filter(t => t.category === categoryFilter);
        }
        if (typeFilter) {
            filteredTransactions = filteredTransactions.filter(t => t.type === typeFilter);
        }
        if (paymentModeFilter) {
            filteredTransactions = filteredTransactions.filter(t => t.paymentMode === paymentModeFilter);
        }
        if (descriptionFilter) {
            filteredTransactions = filteredTransactions.filter(t =>
                t.description && t.description.toLowerCase().includes(descriptionFilter)
            );
        }

        const dateRange = document.getElementById('dateRangeFilter').value;
        if (dateRange) {
            const today = new Date();
            today.setHours(23, 59, 59, 999);
            let fromDate = null;
            let toDate = today;

            if (dateRange === 'custom') {
                const fromVal = document.getElementById('dateFrom').value;
                const toVal = document.getElementById('dateTo').value;
                if (fromVal) fromDate = new Date(fromVal);
                if (toVal) {
                    toDate = new Date(toVal);
                    toDate.setHours(23, 59, 59, 999);
                }
            } else if (dateRange === 'last_month') {
                fromDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                toDate = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59, 999);
            } else if (dateRange === '30') {
                fromDate = new Date(today.getFullYear(), today.getMonth(), 1);
            } else {
                fromDate = new Date(today);
                fromDate.setDate(today.getDate() - parseInt(dateRange));
            }

            filteredTransactions = filteredTransactions.filter(t => {
                const txDate = new Date(t.date);
                if (fromDate && txDate < fromDate) return false;
                if (toDate && txDate > toDate) return false;
                return true;
            });
        }

        // Sort by date (newest first)
        filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Render filter summary
        const summaryContainer = document.getElementById('filterSummary');
        const filteredIncome = filteredTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
        const filteredExpense = filteredTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
        summaryContainer.innerHTML = `
            <span class="filter-income">Income: ${this.formatCurrency(filteredIncome)}</span>
            <span class="filter-expense">Expense: ${this.formatCurrency(filteredExpense)}</span>
            <span class="filter-net">Net: ${this.formatCurrency(filteredIncome - filteredExpense)}</span>
        `;

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

    importFromCSV(file) {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const lines = e.target.result.split('\n').filter(line => line.trim());
            if (lines.length < 2) {
                this.showMessage('CSV file is empty or invalid', 'error');
                return;
            }

            const header = lines[0].toLowerCase();
            if (!header.includes('date') || !header.includes('type') || !header.includes('amount')) {
                this.showMessage('Invalid CSV format. Expected: Date, Type, Category, Amount, Payment Mode, Description', 'error');
                return;
            }

            const imported = [];
            for (let i = 1; i < lines.length; i++) {
                const parts = this.parseCSVLine(lines[i]);
                if (parts.length < 4) continue;

                imported.push({
                    id: Date.now().toString() + i,
                    date: parts[0],
                    type: parts[1],
                    category: parts[2] || '',
                    amount: parseFloat(parts[3]),
                    paymentMode: parts[4] || 'cash',
                    description: parts[5] || '',
                    timestamp: new Date().toISOString()
                });
            }

            if (imported.length === 0) {
                this.showMessage('No valid transactions found in CSV', 'error');
                return;
            }

            const action = confirm(
                `Found ${imported.length} transactions. Press OK to REPLACE all existing data, or Cancel to APPEND to existing data.`
            );

            if (action) {
                this.transactions = imported;
            } else {
                this.transactions = this.transactions.concat(imported);
            }

            this.saveTransactions();
            this.updateUI();
            this.showMessage(`Imported ${imported.length} transactions successfully!`, 'success');
        };

        reader.readAsText(file);
    }

    parseCSVLine(line) {
        const parts = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const ch = line[i];
            if (ch === '"') {
                inQuotes = !inQuotes;
            } else if (ch === ',' && !inQuotes) {
                parts.push(current.trim());
                current = '';
            } else {
                current += ch;
            }
        }
        parts.push(current.trim());
        return parts;
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
