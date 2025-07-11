// Listen for SendPoints button click and handle transfer

document.addEventListener('DOMContentLoaded', () => {
    const sendBtn = document.querySelector('[data-action="SendPoints"]');
    sendBtn?.addEventListener('click', async () => {
        const phone = document.querySelector('input[name="phone"]').value.trim();
        const amount = document.querySelector('input[name="amount"]').value.trim();
        const password = document.querySelector('input[name="password"]').value;
        const confirmPassword = document.querySelector('input[name="confirmPassword"]').value;

        if (!phone || !amount || !password || !confirmPassword) {
            alert('Please fill in all fields.');
            return;
        }
        if (password !== confirmPassword) {
            alert('Passwords do not match.');
            return;
        }
        if (isNaN(amount) || Number(amount) <= 0) {
            alert('Amount must be a positive number.');
            return;
        }

        // Optionally: get token from localStorage or cookies
        const token = localStorage.getItem('token');
        if (!token) {
            alert('You must be logged in.');
            return;
        }

        try {
            const res = await fetch('http://localhost:5000/api/transfer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ phone, amount, password })
            });
            const data = await res.json();
            if (res.ok) {
                alert('Points sent successfully!');
                window.location.href = 'dashboard.html';
            } else {
                alert(data.message || 'Transfer failed.');
            }
        } catch (err) {
            alert('Server error.');
        }
    });
});
