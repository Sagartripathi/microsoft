import express from 'express'
import nodemailer from 'nodemailer'
import { Vonage } from '@vonage/server-sdk'
import fs from 'fs'
import cors from 'cors'

const app = express()

// Enable CORS for all origins
app.use(cors()) // This allows requests from any domain

// Alternatively, if you want to allow only specific origins, you can configure CORS like this:
// app.use(cors({ origin: 'http://your-frontend-domain.com' }));

app.use(express.json()) // To parse JSON request bodies

// Create a Vonage instance
const vonage = new Vonage({
  apiKey: 'f2361a42',
  apiSecret: '3SwnvcCH5QAEJt7D',
})

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'bitpointcloud@gmail.com',
    pass: 'rvug wxem ndzq ebig',
  },
})

// Utility function to send OTP via Email
const sendEmailOtp = (email, otp) => {
  const mailOptions = {
    from: 'your-email@gmail.com', // Replace with your email
    to: email,
    subject: 'Your OTP Verification Code',
    text: `Your OTP code is: ${otp}`,
  }

  return transporter.sendMail(mailOptions)
}

// Utility function to send OTP via SMS (Vonage)
const sendSmsOtp = (phone, otp) => {
  const from = 'Vonage APIs'
  const text = `Your OTP code is: ${otp}`
  console.log(text)

  return vonage.sms.send({ to: phone, from, text })
}

// Route to send OTP
app.post('/send-otp', async (req, res) => {
  const { email, phone } = req.body
  const emailOtp = Math.floor(100000 + Math.random() * 900000).toString() // Generate a 6-digit OTP for email
  const phoneOtp = Math.floor(100000 + Math.random() * 900000).toString() // Generate a 6-digit OTP for phone

  try {
    // Send OTP to email or phone
    if (email) {
      await sendEmailOtp(email, emailOtp)
    }
    if (phone) {
      await sendSmsOtp(phone, phoneOtp)
    }

    // Store user in users.json file with OTP codes and verified fields
    const users = JSON.parse(fs.readFileSync('users.json', 'utf8') || '[]')
    users.push({
      email,
      phone,
      emailOtp,
      phoneOtp,
      emailVerified: false, // Initially not verified
      phoneVerified: false, // Initially not verified
    })
    fs.writeFileSync('users.json', JSON.stringify(users, null, 2))

    res.status(200).json({ message: 'OTP sent successfully!' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error sending OTP' })
  }
})

// Route to verify OTP
app.post('/verify-otp', (req, res) => {
  const { email, phone, otp, type } = req.body

  // Retrieve user data from the users.json file
  const users = JSON.parse(fs.readFileSync('users.json', 'utf8') || '[]')
  const user = users.find((u) => (u.email === email || u.phone === phone) && (u.emailOtp === otp || u.phoneOtp === otp))

  if (user) {
    // If OTP matches, update the verified field
    if (user.emailOtp === otp && type === 'email') {
      user.emailVerified = true
    }
    if (user.phoneOtp === otp && type === 'phone') {
      user.phoneVerified = true
    }

    // Save the updated user data back to the file
    fs.writeFileSync('users.json', JSON.stringify(users, null, 2))

    res.status(200).json({ message: `${type} OTP verified successfully!`, verified: true })
  } else {
    res.status(400).json({ message: 'Invalid OTP' })
  }
})

// Start the server
const PORT = 8080
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
