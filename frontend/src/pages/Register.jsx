import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ fullName: '', email: '', username: '', password: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (formData.password !== formData.confirmPassword) return setError("Passwords do not match. Please try again.");
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

        if (!passwordRegex.test(formData.password)) {
            return setError("Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, and a number.");
        }

        setIsLoading(true);
        const { confirmPassword, ...dataToSend } = formData;

        try {
            const response = await fetch('http://localhost:8080/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSend)
            });

            const message = await response.text();

            if (response.ok) {
                if (message === "Username already exists.") setError("This username is already taken. Please choose another.");
                else if (message === "Email already exists.") setError("An account with this email already exists. Try logging in.");
                else if (message === "Account created successfully.") navigate('/dashboard');
                else setError(message);
            } else {
                setError("Server error: Unable to process registration at this time.");
            }
        } catch (err) {
            setError("Network error. Please ensure the backend server is running.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="page-container">
            {/* Logo and Branding Header */}
            <div className="brand-header">
                <div className="logo-circle">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ff7a00" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
                        <path d="M7 2v20" />
                        <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
                    </svg>
                </div>
                <h1>CampusCrave</h1>
                <p>Campus Food Ordering System</p>
            </div>

            {/* Registration Card */}
            <div className="auth-container">
                <h2>Create an Account</h2>
                
                <div className="error-wrapper">
                    {error && <div className="error-alert">{error}</div>}
                </div>
                
                <form onSubmit={handleSubmit}>
                    <input type="text" name="fullName" placeholder="e.g., Dexter Dela Riarte" required onChange={handleChange} />
                    <input type="email" name="email" placeholder="Email Address" required onChange={handleChange} />
                    <input type="text" name="username" placeholder="Username" required onChange={handleChange} />
                    <input type="password" name="password" placeholder="Password" required onChange={handleChange} />
                    <input type="password" name="confirmPassword" placeholder="Confirm Password" required onChange={handleChange} />
                    <button type="submit" disabled={isLoading}>{isLoading ? 'Registering...' : 'Sign Up'}</button>
                </form>

                <div style={{ marginTop: '20px', fontSize: '14px', color: '#555' }}>
                    Already have an account? <Link to="/login" className="link-text">Login here</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;