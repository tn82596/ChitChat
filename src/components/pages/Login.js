import React, { useState } from 'react'; // Importing React and useState hook
import axios from 'axios'; // Importing Axios for HTTP requests
import '../../styles/Login.css'; // Importing the stylesheet for the Login page

const Login = () => {
  // State to manage form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // State to manage error messages

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent the default form submission behavior

    try {
      // Make the API call to login the user
      const response = await axios.post('http://localhost:5001/user/login', { email, password });
      console.log(response.data); // Handle success - in a real app, you might store the token here
    } catch (err) {
      // Log the error for debugging
      console.error("Error during login:", err);
  
      // Safely handle cases where err.response is undefined
      const errorMessage = err.response?.data?.message || 'An error occurred during login';
      setError(errorMessage); // Set error message in state
    }
  };

  return (
    <div className="login-container">
      <h2>Log In</h2> {/* Page title */}
      <form onSubmit={handleSubmit}> {/* Form submission handler */}
        <div>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)} // Update email state
            required
          />
        </div>
        <div>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)} // Update password state
            required
          />
        </div>
        {error && <div className="error-message">{error}</div>} {/* Conditionally render error message */}
        <button type="submit">Login</button> {/* Submit button */}
      </form>
    </div>
  );
};

export default Login;
