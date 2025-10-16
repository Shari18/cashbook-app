# CashBook - Personal Finance Tracker

A simple, offline-capable Progressive Web App (PWA) for tracking personal income and expenses on your iPhone without needing the App Store.

## 🚀 Quick Start - Deploy Your Own

**Option 1: Netlify (Recommended - 2 minutes)**
1. Download or clone this repository
2. Go to [netlify.com](https://netlify.com) and sign up (free)
3. Drag the entire `cashbook-app` folder to Netlify's deploy area
4. Get your instant URL (e.g., `https://amazing-cashbook-123.netlify.app`)
5. Open the URL on your iPhone Safari → Add to Home Screen

**Option 2: GitHub Pages**
1. Fork this repository
2. Go to repository Settings → Pages
3. Enable Pages from main branch
4. Access at `https://yourusername.github.io/cashbook-app`

**Option 3: Other Free Hosts**
- [Vercel](https://vercel.com) - Drag & drop deployment
- [GitHub Pages](https://pages.github.com) - Git-based deployment
- [Firebase Hosting](https://firebase.google.com/docs/hosting) - Google's platform

## Features

- ✅ **Add/Edit/Delete Transactions**: Record and modify income/expenses with categories
- ✅ **Transaction History**: View and filter all your transactions
- ✅ **Reports**: Monthly summaries and balance calculations
- ✅ **Export Data**: Download transactions as CSV
- ✅ **Offline Support**: Works without internet connection
- ✅ **iPhone Optimized**: Responsive design for mobile use
- ✅ **Install as App**: Add to home screen like a native app

## Categories Included

**Income:** Salary, Freelance, Business, Investment, Gift, Other Income
**Expenses:** Food, Travel, Bills, Shopping, Entertainment, Healthcare, Education, Rent, Investment, EMI, Grocery, Household, Personal, Other Expense.

**Payment Modes:** Cash, UPI, Card, Bank Transfer, Cheque

## Installation on iPhone (After Deployment)

1. **Open your deployed app URL in Safari** (not Chrome)
   - Example: `https://your-app-name.netlify.app`

2. **Add to Home Screen**
   - Tap the Share button (square with arrow up)
   - Scroll down and tap "Add to Home Screen"
   - Give it a name like "My CashBook"
   - Tap "Add" to confirm

3. **Use like a native app**
   - The app icon will appear on your home screen
   - Opens in full-screen mode without browser UI
   - Works offline once installed
   - All data stays private on your device

## How to Use

### Adding Transactions
1. Tap the "Add" tab
2. Enter the amount (without ₹ symbol)
3. Select Income or Expense
4. Choose a category (updates based on type)
5. Select payment mode
6. Add description (optional)
7. Set date (defaults to today)
8. Tap "Add Transaction"

### Editing/Deleting Transactions
1. Go to "Transactions" tab
2. Each transaction has ✏️ (edit) and 🗑️ (delete) buttons
3. **Edit**: Click ✏️ to modify transaction details
4. **Delete**: Click 🗑️ and confirm to remove transaction

### Viewing Transactions
1. Tap "Transactions" tab
2. Use filters to narrow down by category or type
3. Transactions are sorted by date (newest first)

### Reports
1. Tap "Reports" tab
2. View total income, expenses, and balance
3. See monthly breakdown
4. Export data as CSV or clear all data

## Technical Details

- **Technology**: HTML5, CSS3, Vanilla JavaScript
- **Storage**: Local Storage (data stays on your device)
- **Offline**: Service Worker caches the app
- **Size**: ~30KB total (very lightweight)

## 🔒 Security & Privacy

### ✅ Completely Private
- **All financial data stays on YOUR device only**
- No data is ever sent to any server or cloud service
- No tracking, analytics, or data collection
- No user accounts, passwords, or sign-ups required

### ✅ Open Source & Transparent
- Full source code is available for inspection
- No hidden functionality or backdoors
- You can audit exactly what the app does
- Deploy your own version for complete control

### ✅ Offline-First Design
- Works completely offline after initial load
- Internet only needed for the first visit to cache the app
- Your transaction data never leaves your phone/computer
- Export your data anytime as CSV for backup

### ✅ Safe to Share
This repository is safe to share publicly because:
- **No backend servers** - just static files
- **No database** - uses browser's local storage
- **No API keys or secrets** - everything runs client-side
- **Each user gets their own private data** - no shared storage

### 🛡️ Technical Security
- Uses HTTPS when deployed (encrypted connection)
- Progressive Web App security standards
- No external dependencies or third-party trackers
- Local storage is sandboxed per domain/user

## Development

To run locally:
1. Place all files in a folder
2. Open `index.html` in a web browser
3. For full PWA features, serve via HTTP server:
   ```bash
   # Python 3
   python -m http.server 8000

   # Node.js
   npx serve .
   ```

## Troubleshooting

**App not installing on iPhone:**
- Make sure you're using Safari browser
- Clear Safari cache and try again
- Check that JavaScript is enabled

**Data not saving:**
- Ensure local storage is enabled in browser settings
- Check available storage space on device

**App not working offline:**
- Reload the app once while online to cache resources
- Service worker needs initial registration

## 🤝 Contributing

This is an open-source project! Contributions are welcome:

1. **Fork this repository**
2. **Create a feature branch**: `git checkout -b feature-name`
3. **Make your changes** and test thoroughly
4. **Submit a pull request** with a clear description

### Ideas for Contributions:
- New transaction categories
- Additional export formats (PDF, Excel)
- Data visualization charts
- Budget tracking features
- Recurring transactions
- Multiple currency support
- Dark/light theme toggle

## 📄 License

This project is open source and available under the [MIT License](LICENSE). Feel free to use, modify, and distribute as needed.

## 🌟 Why This App?

- **No App Store needed** - Works on any modern smartphone
- **Completely free** - No subscriptions, ads, or hidden costs
- **Privacy-first** - Your financial data stays with you
- **Lightweight** - Only ~30KB, works on old phones too
- **Customizable** - Open source, modify as needed

Perfect for individuals, small businesses, or anyone wanting simple expense tracking without compromising privacy.

## Future Enhancements

Potential features for future versions:
- Data backup/restore to cloud storage (optional)
- Recurring transactions
- Budget tracking and alerts
- Multiple accounts/wallets
- Data visualization charts and trends
- Multi-currency support
- Expense receipt photo attachments