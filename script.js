document.getElementById('loginForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('error-message');

    const BASE_URL = 'https://be-portfolio-shinta.vercel.app/api';

    // Reset error message
    errorMessage.textContent = '';

    try {
        const response = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username,
                password
            })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            // Simpan status login ke sessionStorage
            sessionStorage.setItem('isLoggedIn', 'true');
            alert('Login berhasil!');
            window.location.href = '/frontend_admin/html/kelola-portfolio.html';
        } else {
            errorMessage.textContent = data.message || 'Terjadi kesalahan saat login.';
        }
    } catch (error) {
        errorMessage.textContent = 'Tidak dapat terhubung ke server.';
        console.error('Login error:', error);
    }
});

// Password visibility toggle
const togglePassword = document.getElementById('togglePassword');
const passwordInput = document.getElementById('password'); // Menggunakan nama variabel yang berbeda untuk menghindari konflik

togglePassword.addEventListener('click', function (e) {
    // Toggle the type attribute
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    // Toggle the eye slash icon
    this.classList.toggle('fa-eye-slash');
});