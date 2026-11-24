import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

const AuthGate = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [role, setRole] = useState('customer');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await axios.post(`${API_URL}/login`, { email, password });
            localStorage.setItem('user', JSON.stringify(res.data.user));
            navigate(`/${res.data.user.role}`);
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    const handleSignupSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await axios.post(`${API_URL}/register`, { name, email, password, role });
            setIsLogin(true); // Switch to login view on success
            setError('Registration successful! Please login.'); // Can be a success message
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div id="authScreen">
            <div className="gate-card">
                <div className="gate-logo"><i className="fas fa-ship"></i><span>GlobalShipp</span></div>
                
                {error && <div className="gate-error show" style={{ marginBottom: '1rem' }}>{error}</div>}

                {isLogin ? (
                    <div id="gateLoginView">
                        <h1 className="gate-title">Welcome Back</h1>
                        <p className="gate-subtitle">Sign in to access your dashboard</p>
                        <form onSubmit={handleLoginSubmit} className="gate-form">
                            <div className="gate-group">
                                <label htmlFor="gateLoginEmail">Email Address</label>
                                <input type="email" id="gateLoginEmail" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)} required />
                            </div>
                            <div className="gate-group">
                                <label htmlFor="gateLoginPassword">Password</label>
                                <input type="password" id="gateLoginPassword" placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} required />
                            </div>
                            <button type="submit" className="btn btn-primary auth-button" style={{width: '100%', padding: '1rem', fontSize: '1.05rem'}}>Sign In</button>
                        </form>
                        <p className="gate-switch">Don't have an account? <span onClick={() => { setIsLogin(false); setError(''); }} style={{cursor:'pointer', color: 'var(--secondary)'}}>Sign up</span></p>
                    </div>
                ) : (
                    <div id="gateSignupView">
                        <h1 className="gate-title">Create Account</h1>
                        <p className="gate-subtitle">Sign up to get started with GlobalShipp</p>
                        <form onSubmit={handleSignupSubmit} className="gate-form">
                            <div className="gate-group">
                                <label>I am a...</label>
                                <div className="gate-roles">
                                    <div className={`gate-role ${role === 'customer' ? 'selected' : ''}`} onClick={() => setRole('customer')}>
                                        <i className="fas fa-user"></i><span>Customer</span>
                                    </div>
                                    <div className={`gate-role ${role === 'business' ? 'selected' : ''}`} onClick={() => setRole('business')}>
                                        <i className="fas fa-building"></i><span>Business</span>
                                    </div>
                                    <div className={`gate-role ${role === 'admin' ? 'selected' : ''}`} onClick={() => setRole('admin')}>
                                        <i className="fas fa-user-shield"></i><span>Admin</span>
                                    </div>
                                </div>
                            </div>
                            <div className="gate-group">
                                <label htmlFor="gateSignupName">Full Name</label>
                                <input type="text" id="gateSignupName" placeholder="Enter your full name" value={name} onChange={e => setName(e.target.value)} required />
                            </div>
                            <div className="gate-group">
                                <label htmlFor="gateSignupEmail">Email Address</label>
                                <input type="email" id="gateSignupEmail" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)} required />
                            </div>
                            <div className="gate-group">
                                <label htmlFor="gateSignupPassword">Password</label>
                                <input type="password" id="gateSignupPassword" placeholder="Create a password" value={password} onChange={e => setPassword(e.target.value)} required />
                            </div>
                            <button type="submit" className="btn btn-primary auth-button" style={{width: '100%', padding: '1rem', fontSize: '1.05rem'}}>Create Account</button>
                        </form>
                        <p className="gate-switch">Already have an account? <span onClick={() => { setIsLogin(true); setError(''); }} style={{cursor:'pointer', color: 'var(--secondary)'}}>Sign in</span></p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuthGate;
