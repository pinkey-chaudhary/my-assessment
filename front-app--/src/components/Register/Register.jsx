import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Register.css';

function Register() {
  const [formData, setFormData] = useState({
    first_name: '', last_name: '', email: '', phone: '', password: '', confirm_password: ''
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    let localErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10}$/;

    if (!formData.first_name.trim()) localErrors.first_name = "First name is required";
    if (!formData.last_name.trim()) localErrors.last_name = "Last name is required";
    if (!emailRegex.test(formData.email)) localErrors.email = "Enter a valid email address";
    if (!phoneRegex.test(formData.phone)) localErrors.phone = "Enter a valid phone number (10 digits)";
    if (formData.password.length < 6) localErrors.password = "Password must be at least 6 characters";
    if (formData.password !== formData.confirm_password) localErrors.confirm_password = "Passwords do not match";

    setErrors(localErrors);
    return Object.keys(localErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setApiError('');

    try {
      const response = await fetch('http://localhost:8000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (response.ok) {
        alert("Registration Successful!");
        navigate('/login');
      } else {
        if(Array.isArray(data.detail)){
          setApiError(data.detail[0].msg || "Validation error");
        }
        else if(typeof data.detail === 'string'){
          setApiError(data.detail);
        }
        else{
          setApiError("Registeration failed.Please check your inputs.");
        }
       
      }
    } catch (err) {
        console.error("DEBUG ERROR:",err);
        alert("Form submission crashed because:",+err.message);
      setApiError("Network error. Please try again.");
    }
  };

  const EyeIcon = ({ visible }) => visible ? (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );

  return (
    <div className="auth-container">
      <h2>Create Account</h2>
      {apiError && <div className="api-error">{apiError}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>First Name</label>
          <input type="text" name="first_name" onChange={handleChange} />
          {errors.first_name && <span className="error-text">{errors.first_name}</span>}
        </div>
        <div className="form-group">
          <label>Last Name</label>
          <input type="text" name="last_name" onChange={handleChange} />
          {errors.last_name && <span className="error-text">{errors.last_name}</span>}
        </div>
        <div className="form-group">
          <label>Email</label>
          <input type="email" name="email" onChange={handleChange} />
          {errors.email && <span className="error-text">{errors.email}</span>}
        </div>
        <div className="form-group">
          <label>Phone</label>
          <input type="text" name="phone" onChange={handleChange} />
          {errors.phone && <span className="error-text">{errors.phone}</span>}
        </div>
        
        <div className="form-group">
          <label>Create Password</label>
          <div className="password-wrapper">
            <input type={showPassword ? "text" : "password"} name="password" onChange={handleChange} />
            <button type="button" className="password-toggle-btn" onClick={() => setShowPassword(!showPassword)}>
              <EyeIcon visible={showPassword} />
            </button>
          </div>
          {errors.password && <span className="error-text">{errors.password}</span>}
        </div>

        <div className="form-group">
          <label>Confirm Password</label>
          <div className="password-wrapper">
            <input type={showConfirmPassword ? "text" : "password"} name="confirm_password" onChange={handleChange} />
            <button type="button" className="password-toggle-btn" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
              <EyeIcon visible={showConfirmPassword} />
            </button>
          </div>
          {errors.confirm_password && <span className="error-text">{errors.confirm_password}</span>}
        </div>

        <button type="submit" className="submit-btn">Register</button>
      </form>
      <p className="toggle-link">Already have an account? <Link to="/login">Login here</Link></p>
    </div>
  );
}

export default Register;