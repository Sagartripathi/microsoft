import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'

const App = () => {
  const [formData, setFormData] = useState({
    name: '',
    business: '',
    phone: '',
    ext: '+1',
    email: '',
  })
  const [otpSent, setOtpSent] = useState(false)
  const [otpData, setOtpData] = useState({ phoneOtp: '', emailOtp: '' })
  const [verificationStatus, setVerificationStatus] = useState({
    phoneVerified: false,
    emailVerified: false,
  })
  const [statusMessage, setStatusMessage] = useState('')
  const [errors, setErrors] = useState({}) // New state for form validation errors

  const formStyle = {
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f9f9f9',
    margin: '0 auto',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    maxWidth: '400px',
    width: '100%',
  }

  const labelStyle = {
    display: 'block',
    marginBottom: '5px',
    color: '#555',
  }

  const inputStyle = {
    width: '100%',
    padding: '10px',
    marginBottom: '5px',
    border: '1px solid #ddd',
    borderRadius: '4px',
  }

  const errorStyle = {
    color: 'red',
    marginBottom: '10px',
    fontSize: '12px',
  }

  const buttonStyle = {
    width: '100%',
    padding: '10px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    setErrors((prev) => ({ ...prev, [name]: '' })) // Clear error when user types
  }

  const handleOtpInput = (e) => {
    const { name, value } = e.target
    setOtpData({ ...otpData, [name]: value })
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required.'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const sendOtp = async (e) => {
    e.preventDefault()
    setStatusMessage('')

    if (!validateForm()) {
      return
    }

    try {
      const response = await fetch('http://localhost:8080/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          phone: `${formData.ext}${formData.phone}`,
        }),
      })

      if (response.ok) {
        setOtpSent(true)
        setStatusMessage('OTP sent to email and phone!')
      } else {
        const error = await response.json()
        setStatusMessage(error.message || 'Failed to send OTP.')
      }
    } catch (err) {
      console.error(err)
      setStatusMessage('Error connecting to the server.')
    }
  }

  const verifyOtp = async (e) => {
    e.preventDefault()
    setStatusMessage('')

    try {
      // Verify phone OTP
      const phoneResponse = await fetch('http://localhost:8080/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          phone: `${formData.ext}${formData.phone}`,
          otp: otpData.phoneOtp,
          type: 'phone', // Specify the type
        }),
      })

      const phoneResult = await phoneResponse.json()

      if (!phoneResponse.ok) {
        setStatusMessage(phoneResult.message || 'Failed to verify phone OTP.')
        return
      }

      setVerificationStatus((prev) => ({
        ...prev,
        phoneVerified: phoneResult.phoneVerified,
      }))

      // Verify email OTP
      const emailResponse = await fetch('http://localhost:8080/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          phone: `${formData.ext}${formData.phone}`,
          otp: otpData.emailOtp,
          type: 'email', // Specify the type
        }),
      })

      const emailResult = await emailResponse.json()

      if (!emailResponse.ok) {
        setStatusMessage(emailResult.message || 'Failed to verify email OTP.')
        return
      }

      setVerificationStatus((prev) => ({
        ...prev,
        emailVerified: emailResult.emailVerified,
      }))

      setStatusMessage('Verification complete!')
    } catch (err) {
      console.error(err)
      setStatusMessage('Error connecting to the server.')
    }
  }

  return (
    <div
      style={{
        padding: '20px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
      }}
    >
      <div style={formStyle}>
        <h2 style={{ textAlign: 'center', color: '#333' }}>Sign-In Form</h2>
        {!otpSent ? (
          <form onSubmit={sendOtp}>
            <label htmlFor="name" style={labelStyle}>
              Full Name
            </label>
            <input type="text" id="name" name="name" placeholder="Enter your full name" style={inputStyle} value={formData.name} onChange={handleInputChange} />

            <label htmlFor="business" style={labelStyle}>
              Business Name
            </label>
            <input type="text" id="business" name="business" placeholder="Enter your business name" style={inputStyle} value={formData.business} onChange={handleInputChange} />

            <label htmlFor="phone" style={labelStyle}>
              Phone Number
            </label>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '5px' }}>
              <select id="ext" name="ext" style={{ ...inputStyle, flex: '1' }} value={formData.ext} onChange={handleInputChange}>
                <option value="+1">+1</option>
                <option value="+44">+44</option>
                <option value="+91">+91</option>
                <option value="+977">+977</option>
              </select>
              <input type="tel" id="phone" name="phone" placeholder="123-456-7890" style={{ ...inputStyle, flex: '3' }} value={formData.phone} onChange={handleInputChange} />
            </div>
            {errors.phone && <div style={errorStyle}>{errors.phone}</div>}

            <label htmlFor="email" style={labelStyle}>
              Email
            </label>
            <input type="email" id="email" name="email" placeholder="Enter your email address" style={inputStyle} value={formData.email} onChange={handleInputChange} />
            {errors.email && <div style={errorStyle}>{errors.email}</div>}

            <button type="submit" style={buttonStyle}>
              Send OTP
            </button>
          </form>
        ) : (
          <form onSubmit={verifyOtp}>
            <label htmlFor="phoneOtp" style={labelStyle}>
              Phone OTP
            </label>
            <input id="phoneOtp" name="phoneOtp" placeholder="Enter the OTP sent to your phone" style={inputStyle} value={otpData.phoneOtp} onChange={handleOtpInput} />

            <label htmlFor="emailOtp" style={labelStyle}>
              Email OTP
            </label>
            <input id="emailOtp" name="emailOtp" placeholder="Enter the OTP sent to your email" style={inputStyle} value={otpData.emailOtp} onChange={handleOtpInput} />

            <button type="submit" style={buttonStyle}>
              Verify OTPs
            </button>
          </form>
        )}
        {statusMessage && <p style={{ color: '#333', marginTop: '10px', textAlign: 'center' }}>{statusMessage}</p>}
        {otpSent && (
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <p>Phone Verification: {verificationStatus.phoneVerified ? 'Verified' : 'Not Verified'}</p>
            <p>Email Verification: {verificationStatus.emailVerified ? 'Verified' : 'Not Verified'}</p>
          </div>
        )}
      </div>
    </div>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(<App />)
