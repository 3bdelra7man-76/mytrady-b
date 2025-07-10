// profile.js - Handles dynamic user data for profile.html

document.addEventListener('DOMContentLoaded', async function() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login.html';
        return;
    }

    try {
        const response = await fetch('http://localhost:5000/api/auth/user/profile', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to fetch user data');

        // Set user name (line 35)
        const userNameElem = document.querySelector('[data-i18n="userName"]');
        if (userNameElem) userNameElem.textContent = data.name || 'User';

        // Set joined date (line 38)
        const joinedElem = userNameElem?.nextElementSibling?.querySelector('span[data-i18n="june"]');
        if (joinedElem && data.createdAt) {
            const date = new Date(data.createdAt);
            const options = { year: 'numeric', month: 'long' };
            joinedElem.textContent = date.toLocaleDateString(undefined, options);
        }

        // Set phone number (lines 43, 80)
        const phoneElems = Array.from(document.querySelectorAll('p.font-semibold[dir="ltr"]'));
        phoneElems.forEach(elem => {
            elem.textContent = data.phone || '';
        });
    } catch (err) {
        console.error('Failed to load user profile:', err);
    }

    // Change Phone Number functionality
    const updateNumberBtn = document.querySelector('#changeNumberModal button[data-i18n="updateNumber"]');
    if (updateNumberBtn) {
        updateNumberBtn.addEventListener('click', async function () {
            const modal = document.getElementById('changeNumberModal');
            const newPhoneInput = modal.querySelector('input[type="tel"]');
            const passwordInput = modal.querySelector('input[type="password"]');
            const newPhone = newPhoneInput.value.trim();
            const password = passwordInput.value;
            if (!newPhone || !password) {
                alert('Please enter your new phone number and password.');
                return;
            }
            const token = localStorage.getItem('token');
            try {
                const response = await fetch('http://localhost:5000/api/profile/update', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ newPhone, password })
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.error || 'Failed to update phone number');
                // Update phone number in UI
                document.querySelectorAll('p.font-semibold[dir="ltr"]').forEach(elem => {
                    elem.textContent = data.phone;
                });
                // Clear input fields after successful update
                newPhoneInput.value = '';
                passwordInput.value = '';
                alert('Phone number updated successfully!');
                closeModal();
            } catch (err) {
                alert('Error: ' + err.message);
            }
        });
    }

    // Change Password functionality
    const updatePasswordBtn = document.querySelector('#changePasswordModal button[data-i18n="updatePassword"]');
    if (updatePasswordBtn) {
        updatePasswordBtn.addEventListener('click', async function () {
            const modal = document.getElementById('changePasswordModal');
            const currentPasswordInput = modal.querySelector('input[placeholder="Enter current password"]');
            const newPasswordInput = modal.querySelector('input[placeholder="Enter new password"]');
            const confirmNewPasswordInput = modal.querySelector('input[placeholder="Confirm new password"]');
            const currentPassword = currentPasswordInput.value;
            const newPassword = newPasswordInput.value;
            const confirmNewPassword = confirmNewPasswordInput.value;
            if (!currentPassword || !newPassword || !confirmNewPassword) {
                alert('Please fill in all password fields.');
                return;
            }
            if (newPassword !== confirmNewPassword) {
                alert('New passwords do not match.');
                return;
            }
            const token = localStorage.getItem('token');
            try {
                const response = await fetch('http://localhost:5000/api/profile/change-password', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ currentPassword, newPassword })
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.error || 'Failed to update password');
                // Clear input fields after successful update
                currentPasswordInput.value = '';
                newPasswordInput.value = '';
                confirmNewPasswordInput.value = '';
                alert('Password updated successfully!');
                closeModal();
            } catch (err) {
                alert('Error: ' + err.message);
            }
        });
    }

    // Delete Account functionality
    const deleteAccountBtn = document.querySelector('#deleteAccountModal button[data-i18n="deleteAccount"]');
    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', async function () {
            const modal = document.getElementById('deleteAccountModal');
            const passwordInput = modal.querySelector('input[placeholder="Enter your password"]');
            const confirmCheckbox = modal.querySelector('#confirmDelete');
            const password = passwordInput.value;
            if (!password) {
                alert('Please enter your password.');
                return;
            }
            if (!confirmCheckbox.checked) {
                alert('Please confirm that you understand this action is irreversible.');
                return;
            }
            const token = localStorage.getItem('token');
            try {
                const response = await fetch('http://localhost:5000/api/profile/delete', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ password })
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.error || 'Failed to delete account');
                // Clear token and redirect
                localStorage.removeItem('token');
                alert('Account deleted successfully!');
                window.location.href = '../Public/Index.html';
            } catch (err) {
                alert('Error: ' + err.message);
            }
        });
    }
});
