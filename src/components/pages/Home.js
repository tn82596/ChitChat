import React from 'react';
import { useNavigate } from 'react-router-dom'; // For redirecting after successful signup
import '../../styles/Home.css'

const Home = () => {
    const navigate = useNavigate(); // To redirect to signup/login after clicking button
    const handleLogin = () => navigate('/login');
    const handleSignup = () => navigate('/signup');

    return (
        <div className="welcome-container">
            <h1>Welcome to ChitChat</h1>
            <div className="buttons">
                <button className="login-button" onClick={handleLogin}>
                    Log In
                </button>
                <button className="signup-button" onClick={handleSignup}>
                    Sign Up
                </button>
            </div>
        </div>
    )
}

export default Home;