// Fallback translate function if not defined globally
if (typeof translate !== 'function') {
    function translate(key) {
        // Just return the key as a fallback
        return key;
    }
}

// Function to format date
function formatDate(dateString) {
    const date = new Date(dateString);
    const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
    return `${translate(months[date.getMonth()])} ${date.getDate()}, ${date.getFullYear()}`;
}

// Function to load transactions
async function loadTransactions() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/index.html';
            return;
        }

        const response = await fetch('http://localhost:5000/api/history', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch transactions');
        }

        const transactions = await response.json();
        const transactionList = document.getElementById('transactionList');
        transactionList.innerHTML = '';

        transactions.forEach(transaction => {
            const div = document.createElement('div');
            div.className = 'flex justify-between items-center bg-gray-50 dark:bg-gray-700 transition-colors duration-300 px-4 py-2 rounded-xl shadow-sm';
            
            const amountClass = transaction.type === 'sent' ? 'text-red-600' : 'text-green-600';
            const amountPrefix = transaction.type === 'sent' ? '-' : '+';
            
            div.innerHTML = `
                <div>
                    <p class="font-semibold text-gray-900 dark:text-gray-100" data-i18n="${transaction.type === 'sent' ? 'sentTo' : 'receivedFrom'}"></p>
                    <p class="text-sm text-gray-700 dark:text-gray-300">${transaction.otherParty.phone}</p>
                    <p class="text-xs text-gray-600 dark:text-gray-400">${formatDate(transaction.date)}</p>
                </div>
                <p class="${amountClass} font-bold">${amountPrefix}${transaction.amount} <span data-i18n="points"></span></p>
            `;
            
            transactionList.appendChild(div);
        });
        translatePage();

    } catch (error) {
        console.error('Error loading transactions:', error);
        // Show error message to user
        alert(translate('errorLoadingTransactions') + ': ' + (error.message || error));
    }
}

// Load transactions when page loads
document.addEventListener('DOMContentLoaded', () => {
    loadTransactions();

    // Handle search functionality
    const searchInput = document.querySelector('input[type="text"]');
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const transactions = document.querySelectorAll('#transactionList > div');
        
        transactions.forEach(transaction => {
            const text = transaction.textContent.toLowerCase();
            transaction.style.display = text.includes(searchTerm) ? 'flex' : 'none';
        });
    });
});
