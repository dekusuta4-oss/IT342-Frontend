import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const navigate = useNavigate();
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => setCredentials({ ...credentials, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:8080/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials)
            });

            const message = await response.text();

            if (response.ok && message.includes("Login Success")) {
                const token = message.split("Session-Token: ")[1];
                localStorage.setItem('authToken', token);
                localStorage.setItem('username', credentials.username);
                navigate('/dashboard');
            } else {
                setError(message || "Invalid username or password. Please try again.");
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

            {/* Login Card */}
            <div className="auth-container">
                <h2>Welcome Back</h2>
                
                <div className="error-wrapper">
                    {error && <div className="error-alert">{error}</div>}
                </div>
                
                <form onSubmit={handleSubmit}>
                    <input type="text" name="username" placeholder="Username" required onChange={handleChange} />
                    <input type="password" name="password" placeholder="Password" required onChange={handleChange} />
                    <button type="submit" disabled={isLoading}>{isLoading ? 'Logging in...' : 'Login'}</button>
                </form>

                <div style={{ marginTop: '20px', fontSize: '14px', color: '#555' }}>
                    Don't have an account? <Link to="/register" className="link-text">Register here</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;