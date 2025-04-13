let token = localStorage.getItem('token');
let apiKey = localStorage.getItem('apiKey');
const baseUrl = window.BASE_URL;

// Check if user is logged in
function checkAuth() {
    const loginButton = document.getElementById('loginButton');
    const logoutButton = document.getElementById('logoutButton');
    const expirationOptions = document.getElementById('expirationOptions');

    if (token && apiKey) {
        loginButton.style.display = 'none';
        logoutButton.style.display = 'inline-block';
        expirationOptions.style.display = 'block';
    } else {
        loginButton.style.display = 'inline-block';
        logoutButton.style.display = 'none';
        expirationOptions.style.display = 'none';
        // Clear any stored tokens if they're incomplete
        localStorage.removeItem('token');
        localStorage.removeItem('apiKey');
        token = null;
        apiKey = null;
    }
}

// Show login form
function showLoginForm() {
    document.querySelector('.auth-section').style.display = 'flex';
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
}

// Hide login form
function hideLoginForm() {
    document.querySelector('.auth-section').style.display = 'none';
}

// Logout user
function logout() {
    try {
        // Clear all auth-related data
        localStorage.removeItem('token');
        localStorage.removeItem('apiKey');
        token = null;
        apiKey = null;

        // Reset UI state
        document.getElementById('originalUrl').value = '';
        document.getElementById('customCode').value = '';
        document.getElementById('expiration').value = '';
        document.getElementById('result').style.display = 'none';
        
        // Update auth state
        checkAuth();
        
        // Show success message
        showMessage('Logged out successfully', 'success');
    } catch (error) {
        console.error('Logout error:', error);
        showMessage('Error during logout', 'error');
    }
}

// Toggle between login and register forms
function toggleForms() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    if (loginForm.style.display === 'none') {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
    } else {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
    }
}

// Register new user
async function register() {
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            token = data.token;
            apiKey = data.apiKey;
            localStorage.setItem('token', token);
            localStorage.setItem('apiKey', apiKey);
            hideLoginForm();
            checkAuth();
            showMessage('Registration successful!', 'success');
        } else {
            showMessage(data.message || 'Registration failed', 'error');
        }
    } catch (error) {
        showMessage('An error occurred', 'error');
    }
}

// Login user
async function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            token = data.token;
            apiKey = data.apiKey;
            localStorage.setItem('token', token);
            localStorage.setItem('apiKey', apiKey);
            hideLoginForm();
            checkAuth();
            showMessage('Login successful!', 'success');
        } else {
            showMessage(data.message || 'Login failed', 'error');
        }
    } catch (error) {
        showMessage('An error occurred', 'error');
    }
}

// Shorten URL
async function shortenUrl() {
    const originalUrl = document.getElementById('originalUrl').value;
    const customCode = document.getElementById('customCode').value;
    const expiration = document.getElementById('expiration').value;

    const headers = {
        'Content-Type': 'application/json'
    };

    const body = {
        originalUrl,
        customCode: customCode || undefined
    };

    // Only add authentication headers and expiration if logged in
    if (token && apiKey) {
        headers['x-api-key'] = apiKey;
        headers['Authorization'] = `Bearer ${token}`;
        body.expiresIn = expiration;
    }

    try {
        const response = await fetch('/api/url/shorten', {
            method: 'POST',
            headers,
            body: JSON.stringify(body)
        });

        const data = await response.json();

        if (response.ok) {
            const shortUrl = `${baseUrl}/${data.shortCode}`;
            document.getElementById('shortenedUrl').value = shortUrl;
            document.getElementById('originalUrlDisplay').textContent = data.originalUrl;
            document.getElementById('expiresAt').textContent = new Date(data.expiresAt).toLocaleString();
            document.getElementById('result').style.display = 'block';
            showMessage('URL shortened successfully!', 'success');
        } else {
            if (response.status === 401 && token) {
                // If unauthorized and was logged in, clear tokens and show auth section
                localStorage.removeItem('token');
                localStorage.removeItem('apiKey');
                token = null;
                apiKey = null;
                checkAuth();
                showMessage('Session expired. Please login again.', 'error');
            } else {
                showMessage(data.error || 'Failed to shorten URL', 'error');
            }
        }
    } catch (error) {
        showMessage('An error occurred', 'error');
    }
}

// Copy shortened URL to clipboard
function copyToClipboard() {
    const shortenedUrl = document.getElementById('shortenedUrl');
    shortenedUrl.select();
    document.execCommand('copy');
    showMessage('URL copied to clipboard!', 'success');
}

// Show message to user
function showMessage(message, type) {
    const errorDiv = document.getElementById('error');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    errorDiv.style.backgroundColor = type === 'error' ? '#fde8e8' : '#e8fde8';
    errorDiv.style.color = type === 'error' ? '#e74c3c' : '#2ecc71';

    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 3000);
}

// Add event listeners when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Auth buttons
    document.getElementById('loginButton').addEventListener('click', showLoginForm);
    document.getElementById('logoutButton').addEventListener('click', logout);
    document.getElementById('closeAuthButton').addEventListener('click', hideLoginForm);
    
    // Form submissions
    document.getElementById('loginSubmitButton').addEventListener('click', login);
    document.getElementById('registerSubmitButton').addEventListener('click', register);
    
    // Form toggles
    document.getElementById('showRegisterButton').addEventListener('click', (e) => {
        e.preventDefault();
        toggleForms();
    });
    document.getElementById('showLoginButton').addEventListener('click', (e) => {
        e.preventDefault();
        toggleForms();
    });
    
    // URL shortening
    document.getElementById('shortenButton').addEventListener('click', shortenUrl);
    document.getElementById('copyButton').addEventListener('click', copyToClipboard);
    
    // Initialize auth state
    checkAuth();
}); 