document.addEventListener("DOMContentLoaded", () => {
    // Toggle Mobile Menu
    const navToggle = document.getElementById("nav-toggle");
    const navLinks = document.querySelector(".nav-links");

    navToggle?.addEventListener("change", () => {
        navLinks.classList.toggle("active");
    });

    // Smooth Scroll for internal navigation links
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) target.scrollIntoView({ behavior: 'smooth' });
        });
    });

    // Helper function to get JWT token from localStorage
    const getToken = () => localStorage.getItem('token');

    // Helper function to make API requests
    const apiRequest = async (url, method, body = null, auth = false) => {
        const headers = {
            'Content-Type': 'application/json'
        };
        if (auth) {
            const token = getToken();
            if (!token) throw new Error('No token found');
            headers['Authorization'] = `Bearer ${token}`;
        }

        const options = { method, headers };
        if (body) options.body = JSON.stringify(body);

        const response = await fetch(`http://localhost:5000${url}`, options);
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Request failed');
        return data;
    };

    // Handle "Request Pickup" button click
    const requestBtn = document.getElementById('request-pickup');
    requestBtn?.addEventListener('click', async () => {
        try {
            const address = prompt('Please enter your address for pickup:');
            if (!address) return;

            const data = await apiRequest('/api/pickup', 'POST', { address }, true);
            alert(data.message);
        } catch (err) {
            alert(err.message);
        }
    });

    // Handle "Report Waste" CTA Button
    const reportBtn = document.getElementById('report-waste');
    reportBtn?.addEventListener('click', async () => {
        try {
            const description = prompt('Describe the waste issue:');
            const location = prompt('Enter the location of the waste:');
            if (!description || !location) return;

            const data = await apiRequest('/api/report-waste', 'POST', { description, location }, true);
            alert(data.message);
        } catch (err) {
            alert(err.message);
        }
    });

    // Modal Functions for Sign In/Sign Up (index.html)
    window.showSignIn = function () {
        document.getElementById('signInForm').style.display = 'block';
        document.getElementById('signUpForm').style.display = 'none';
    };

    window.showSignUp = function () {
        document.getElementById('signInForm').style.display = 'none';
        document.getElementById('signUpForm').style.display = 'block';
    };

    window.closeModal = function () {
        document.getElementById('auth-modal').style.display = 'none';
    };

    // Open modal when Sign Up button in navbar is clicked
    const signupBtn = document.querySelector('.signup-btn');
    signupBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('auth-modal').style.display = 'block';
        showSignUp();
    });

    // Handle Modal Sign In Form Submission
    const modalSignInForm = document.getElementById('modal-signin-form');
    modalSignInForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('signin-email').value;
        const password = document.getElementById('signin-password').value;

        try {
            const data = await apiRequest('/api/auth/signin', 'POST', { email, password });
            localStorage.setItem('token', data.token);
            alert(data.message);
            closeModal();
        } catch (err) {
            alert(err.message);
        }
    });

    // Handle Modal Sign Up Form Submission
    const modalSignUpForm = document.getElementById('modal-signup-form');
    modalSignUpForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;

        try {
            const data = await apiRequest('/api/auth/signup', 'POST', {
                fullName: 'User', // Add a field in the modal if needed
                email,
                password,
                phoneNumber: '1234567890', // Add a field in the modal if needed
                city: 'Unknown' // Add a field in the modal if needed
            });
            alert(data.message);
            window.location.href = 'emailverify.html';
        } catch (err) {
            alert(err.message);
        }
    });

    // Handle Sign In Form Submission (signin.html)
    const signInForm = document.getElementById('signin-form');
    signInForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = signInForm.querySelector('input[type="email"]').value;
        const password = signInForm.querySelector('input[type="password"]').value;

        try {
            const data = await apiRequest('/api/auth/signin', 'POST', { email, password });
            localStorage.setItem('token', data.token);
            alert(data.message);
            window.location.href = 'index.html';
        } catch (err) {
            alert(err.message);
        }
    });

    // Handle Sign Up Form Submission (signup.html)
    const signUpForm = document.getElementById('signup-form');
    signUpForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fullName = signUpForm.querySelector('input[placeholder="Full Name"]').value;
        const email = signUpForm.querySelector('input[type="email"]').value;
        const password = signUpForm.querySelector('input[type="password"]').value;
        const phoneNumber = signUpForm.querySelector('input[type="tel"]').value;
        const city = signUpForm.querySelector('input[placeholder="City"]').value;

        try {
            const data = await apiRequest('/api/auth/signup', 'POST', { fullName, email, password, phoneNumber, city });
            alert(data.message);
            window.location.href = 'emailverify.html';
        } catch (err) {
            alert(err.message);
        }
    });

    // Handle Forget Password Form Submission (forgetpassword.html)
    const forgetPasswordForm = document.getElementById('forgetpassword-form');
    forgetPasswordForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = forgetPasswordForm.querySelector('input[type="email"]').value;

        try {
            const data = await apiRequest('/api/auth/forgot-password', 'POST', { email });
            alert(data.message);
            window.location.href = 'signin.html';
        } catch (err) {
            alert(err.message);
        }
    });

    // Handle Email Verification Form Submission (emailverify.html)
    const emailVerifyForm = document.getElementById('emailverify-form');
    emailVerifyForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = prompt('Please enter your email:'); // Ideally, pass this via query param or localStorage
        const code = emailVerifyForm.querySelector('input[type="text"]').value;

        try {
            const data = await apiRequest('/api/auth/verify-email', 'POST', { email, code });
            localStorage.setItem('token', data.token);
            alert(data.message);
            window.location.href = 'signin.html';
        } catch (err) {
            alert(err.message);
        }
    });

    // Handle Resend Code Link (emailverify.html)
    const resendCodeLink = document.getElementById('resend-code');
    resendCodeLink?.addEventListener('click', async (e) => {
        e.preventDefault();
        const email = prompt('Please enter your email:'); // Ideally, pass this via query param or localStorage

        try {
            const data = await apiRequest('/api/auth/resend-code', 'POST', { email });
            alert(data.message);
        } catch (err) {
            alert(err.message);
        }
    });
});
