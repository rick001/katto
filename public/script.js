let token = localStorage.getItem('token');
let apiKey = localStorage.getItem('apiKey');
const baseUrl = window.BASE_URL;

// Show login modal
function showLogin() {
    document.getElementById('loginModal').classList.add('active');
}

// Hide login modal
function hideLogin() {
    document.getElementById('loginModal').classList.remove('active');
}

// Show register modal
function showRegister() {
    document.getElementById('registerModal').classList.add('active');
}

// Hide register modal
function hideRegister() {
    document.getElementById('registerModal').classList.remove('active');
}

// Check if user is logged in
async function checkAuth() {
    const token = localStorage.getItem('token');
    const apiKey = localStorage.getItem('apiKey');
    const expirationOptions = document.getElementById('expirationOptions');
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const logoutBtn = document.getElementById('logoutBtn');

    if (token && apiKey) {
        try {
            const response = await fetch('/api/auth/me', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'x-api-key': apiKey
                }
            });

            if (response.ok) {
                // User is authenticated
                expirationOptions.style.display = 'block';
                loginBtn.style.display = 'none';
                registerBtn.style.display = 'none';
                logoutBtn.style.display = 'block';
                hideLogin();
                hideRegister();
            } else {
                // Token expired or invalid
                handleLogout();
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            handleLogout();
        }
    } else {
        handleLogout();
    }
}

// Handle logout state
function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('apiKey');
    token = null;
    apiKey = null;
    
    const expirationOptions = document.getElementById('expirationOptions');
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    
    expirationOptions.style.display = 'none';
    loginBtn.style.display = 'block';
    registerBtn.style.display = 'block';
    logoutBtn.style.display = 'none';
}

// Logout user
function logout() {
    handleLogout();
    showMessage('Logged out successfully', 'success');
}

// Register new user
async function register() {
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;

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
            hideRegister();
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
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

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
            hideLogin();
            checkAuth();
            showMessage('Login successful!', 'success');
        } else {
            showMessage(data.message || 'Login failed', 'error');
        }
    } catch (error) {
        showMessage('An error occurred', 'error');
    }
}

// Function to get default API key
async function getDefaultApiKey() {
    try {
        const response = await fetch('/api/auth/default-key');
        if (response.status === 404) {
            // In production, use a pre-configured default API key
            return baseUrl.includes('localhost') ? null : process.env.DEFAULT_API_KEY;
        }
        const data = await response.json();
        if (response.ok) {
            return data.apiKey;
        }
        throw new Error(data.error || 'Failed to get default API key');
    } catch (error) {
        console.error('Error getting default API key:', error);
        throw error;
    }
}

// Function to shorten URL
async function shortenUrl() {
    const originalUrl = document.getElementById('originalUrl').value;
    const customCode = document.getElementById('customCode').value;
    const expirationSelect = document.getElementById('expirationSelect');
    const expirationOptions = document.getElementById('expirationOptions');
    
    if (!originalUrl) {
        showMessage('Please enter a URL', 'error');
        return;
    }

    try {
        const token = localStorage.getItem('token');
        let apiKey = localStorage.getItem('apiKey');
        
        // If not logged in, get the default API key
        if (!token || !apiKey) {
            apiKey = await getDefaultApiKey();
        }
        
        const headers = {
            'Content-Type': 'application/json',
            'x-api-key': apiKey
        };
        
        // Add auth token if user is logged in
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const body = {
            originalUrl,
            customCode: customCode || undefined
        };

        // Only add expiration if user is logged in and expiration options are visible
        if (expirationOptions.style.display !== 'none' && expirationSelect.value) {
            body.expiresIn = expirationSelect.value;
        }

        const response = await fetch('/api/url/shorten', {
            method: 'POST',
            headers,
            body: JSON.stringify(body)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to shorten URL');
        }

        const shortenedUrl = `${baseUrl}/${data.shortCode}`;
        document.getElementById('shortenedUrl').value = shortenedUrl;
        document.getElementById('originalUrlDisplay').textContent = data.originalUrl;
        document.getElementById('expiresAt').textContent = new Date(data.expiresAt).toLocaleString();
        document.getElementById('result').style.display = 'block';
        showMessage('URL shortened successfully!', 'success');
    } catch (error) {
        showMessage(error.message, 'error');
    }
}

// Copy shortened URL to clipboard
async function copyToClipboard() {
    const shortenedUrl = document.getElementById('shortenedUrl').value;
    try {
        await navigator.clipboard.writeText(shortenedUrl);
        showMessage('URL copied to clipboard!', 'success');
    } catch (err) {
        // Fallback for older browsers
        const shortenedUrlInput = document.getElementById('shortenedUrl');
        shortenedUrlInput.select();
        try {
            document.execCommand('copy');
            showMessage('URL copied to clipboard!', 'success');
        } catch (err) {
            showMessage('Failed to copy URL', 'error');
        }
    }
}

// Show message to user
function showMessage(message, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = message;
    messageDiv.style.display = 'block';
    messageDiv.className = `message ${type}`;

    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 3000);
}

// Add event listeners when the document loads
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication status
    checkAuth();
    
    // Add click listeners to auth buttons
    document.getElementById('loginBtn').addEventListener('click', showLogin);
    document.getElementById('registerBtn').addEventListener('click', showRegister);
    document.getElementById('logoutBtn').addEventListener('click', logout);
    
    // Add click listeners to modal close buttons
    document.getElementById('closeLoginModal').addEventListener('click', hideLogin);
    document.getElementById('closeRegisterModal').addEventListener('click', hideRegister);
    
    // Close modals when clicking outside
    document.getElementById('loginModal').addEventListener('click', function(e) {
        if (e.target === this) hideLogin();
    });
    
    document.getElementById('registerModal').addEventListener('click', function(e) {
        if (e.target === this) hideRegister();
    });
    
    // Add form submit listeners
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        login();
    });
    
    document.getElementById('registerForm').addEventListener('submit', function(e) {
        e.preventDefault();
        register();
    });

    // Add click listener for shorten button
    document.getElementById('shortenButton').addEventListener('click', shortenUrl);

    // Add click listener for copy button
    document.getElementById('copyButton').addEventListener('click', copyToClipboard);
    
    // Add escape key listener to close modals
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            hideLogin();
            hideRegister();
        }
    });
}); 