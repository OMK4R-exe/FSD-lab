document.addEventListener('DOMContentLoaded', () => {
    const loginTab = document.getElementById('show-login');
    const signupTab = document.getElementById('show-signup');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');

    // Tab Switching functionality
    loginTab.addEventListener('click', () => {
        loginTab.classList.add('active');
        signupTab.classList.remove('active');
        loginForm.classList.add('active-form');
        signupForm.classList.remove('active-form');
        clearMessages();
    });

    signupTab.addEventListener('click', () => {
        signupTab.classList.add('active');
        loginTab.classList.remove('active');
        signupForm.classList.add('active-form');
        loginForm.classList.remove('active-form');
        clearMessages();
    });

    // Validates password exactly as requested:
    // 1. At least 1 alphabet character
    // 2. At least 1 digit character
    // 3. At least 1 symbol check (!@#$%^&* etc.)
    // 4. No other characters allowed (i.e., only alphabets, digits, and allowed symbols. No spaces, no unicode, etc.)
    const validatePassword = (password) => {
        // Enforce minimum length of 8 characters
        // Checks positive lookaheads for letters, numbers, and symbols.
        // Finally, ensures the entire string matches only letters, numbers, and symbols.
        const strictRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`])[a-zA-Z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]{8,}$/;

        return strictRegex.test(password);
    };

    // Sign Up Form Submit Logic
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const password = document.getElementById('signup-password').value;
        const messageEl = document.getElementById('signup-message');

        if (!validatePassword(password)) {
            messageEl.textContent = 'Invalid Password. Must be at least 8 chars and contain 1 letter, 1 digit, and 1 symbol. No spaces or other characters allowed.';
            messageEl.className = 'message error';
            return;
        }

        // Simulating successful registration
        messageEl.textContent = 'Account created successfully!';
        messageEl.className = 'message success';
        signupForm.reset();
    });

    // Login Form Submit Logic
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const messageEl = document.getElementById('login-message');

        // Simulating successful login
        messageEl.textContent = 'Login successful!';
        messageEl.className = 'message success';
        loginForm.reset();
    });

    function clearMessages() {
        document.getElementById('login-message').textContent = '';
        document.getElementById('signup-message').textContent = '';
    }
});
