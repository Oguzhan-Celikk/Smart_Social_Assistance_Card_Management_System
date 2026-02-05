class LoginManager {
    constructor() {
    // Point to backend API base URL
    this.apiBaseUrl = 'http://localhost:5032/api';
        this.init();
    }

    init() {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // TC Kimlik validation
        const nationalIdInput = document.getElementById('nationalId');
        if (nationalIdInput) {
            nationalIdInput.addEventListener('input', this.validateNationalId);
        }
    }

    validateNationalId(e) {
        e.target.value = e.target.value.replace(/\D/g, '').substring(0, 11);
    }

    async handleLogin(e) {
        e.preventDefault();

        const nationalId = document.getElementById('nationalId').value.trim();
        const password = document.getElementById('password').value.trim();
        const loginButton = document.getElementById('loginButton');

        // Validation
        if (!this.validateInputs(nationalId, password)) {
            return;
        }

        // Show loading
        this.setLoadingState(loginButton, true);
        this.hideError();

        try {
            const response = await fetch(`${this.apiBaseUrl}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    National_ID: nationalId,
                    Password: password
                })
            });

            const result = await response.json();

            if (response.ok && result.token) {
                this.handleLoginSuccess(result);
            } else {
                this.showError('Giriş başarısız. Bilgilerinizi kontrol edin.');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showError('Bağlantı hatası. Lütfen tekrar deneyin.');
        } finally {
            this.setLoadingState(loginButton, false);
        }
    }

    validateInputs(nationalId, password) {
        if (!nationalId || !password) {
            this.showError('Lütfen tüm alanları doldurun.');
            return false;
        }

        if (nationalId.length !== 11) {
            this.showError('TC Kimlik No 11 haneli olmalıdır.');
            return false;
        }

        return true;
    }

    handleLoginSuccess(result) {
        // Store user info
        localStorage.setItem('userToken', result.token);
        localStorage.setItem('userRole', result.role);

        // Redirect based on role
        if (result.role === 'admin') {
            window.location.href = '/admin.html';
        } else if (result.role === 'user') {
            window.location.href = '/user.html';
        } else {
            this.showError('Geçersiz kullanıcı rolü.');
        }
    }

    setLoadingState(button, isLoading) {
        if (isLoading) {
            button.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Giriş yapılıyor...';
            button.disabled = true;
        } else {
            button.innerHTML = '<i class="fas fa-sign-in-alt me-2"></i>Giriş Yap';
            button.disabled = false;
        }
    }

    showError(message) {
        const errorAlert = document.getElementById('errorAlert');
        const errorMessage = document.getElementById('errorMessage');

        if (errorAlert && errorMessage) {
            errorMessage.textContent = message;
            errorAlert.style.display = 'block';

            setTimeout(() => {
                errorAlert.style.display = 'none';
            }, 5000);
        }
    }

    hideError() {
        const errorAlert = document.getElementById('errorAlert');
        if (errorAlert) {
            errorAlert.style.display = 'none';
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    new LoginManager();
});