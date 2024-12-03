import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/Home.css';

const Home = () => {
    const navigate = useNavigate();
    const handleLogin = () => navigate('/login');
    const handleSignup = () => navigate('/signup');

    return (
        <div className="home-container">
            <div className="welcome-container">
                <div className="logo-container">
                    {/* Replace with the new src path */}
                    <img src="IMG_1505.jpg" alt="ChitChat Logo" className="logo" />
                    <h1>ChitChat</h1> {/* Title next to logo */}
                </div>
                <div className="button-container">
                    <div className="buttons">
                        <button className="login-button" onClick={handleLogin}>
                            Log In
                        </button>
                        <button className="signup-button" onClick={handleSignup}>
                            Sign Up
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
