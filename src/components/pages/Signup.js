import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // For redirecting after successful signup
import axios from 'axios';
import '../../styles/Signup.css';

const Signup = () => {
  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate(); // To redirect to login after successful signup

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:5001/user/signup', {
        name,
        email,
        password
      });

      // Check if signup is successful
      if (response.status === 201) {
        // Redirect to login page after successful signup
        navigate('/login');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    }
  };

  // Handle Go Back button click
  const handleGoBack = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className="signup-welcome-container">
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>

      <div className="button-container">
        <div className="buttons">
          <button className="signup-button" onClick={handleSubmit}>
            Sign Up
          </button>
          <button className="go-back-button" onClick={handleGoBack}>
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default Signup;
