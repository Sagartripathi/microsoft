import express from 'express'
import fs from 'fs/promises'
import nodemailer from 'nodemailer'
import twilio from 'twilio'
import cors from 'cors'

const app = express()
const PORT = 8080

// Middleware
app.use(cors())
app.use(express.json())

// File and credentials
const usersFile = './users.json'
const accountSid = 'AC474567c0bd82fee3e19ffb8de0e38880'
const authToken = 'c0e4d29d80022463ce25ac34f2e37e61'
const twilioPhone = '+17855724799'

const twilioClient = twilio(accountSid, authToken)

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'bitpointcloud@gmail.com',
    pass: 'rvug wxem ndzq ebig',
  },
})

// Utility functions
const readUsers = async () => {
  try {
    const data = await fs.readFile(usersFile, 'utf8')
    return JSON.parse(data)
  } catch (err) {
    console.error('Error reading users:', err)
    return []
  }
}

const writeUsers = async (data) => {
  try {
    await fs.writeFile(usersFile, JSON.stringify(data, null, 2), 'utf8')
  } catch (err) {
    console.error('Error writing users:', err)
  }
}

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString()

// API endpoints

// Send OTP
app.post('/send-otp', async (req, res) => {
  const { email, phone } = req.body

  if (!email || !phone) {
    return res.status(400).json({ message: 'Email and phone are required.' })
  }

  try {
    const users = await readUsers()
    let user = users.find((u) => u.email === email && u.phone === phone)

    const emailOtp = generateOTP()
    const phoneOtp = generateOTP()
    const otpExpiry = Date.now() + 5 * 60 * 1000 // OTP expires in 5 minutes

    if (user) {
      // Update existing user
      user.emailOtp = emailOtp
      user.phoneOtp = phoneOtp
      user.otpExpiry = otpExpiry
    } else {
      // Create a new user entry
      user = {
        email,
        phone,
        emailOtp,
        phoneOtp,
        otpExpiry,
        emailVerified: false,
        phoneVerified: false,
      }
      users.push(user)
    }

    await writeUsers(users)

    // Send OTP via email
    const mailOptions = {
      from: 'bitpointcloud@gmail.com',
      to: email,
      subject: 'Your Email OTP',
      text: `Your email OTP is ${emailOtp}`,
    }

    await transporter.sendMail(mailOptions)

    // Send OTP via SMS
    await twilioClient.messages.create({
      body: `Your phone OTP is ${phoneOtp}`,
      from: twilioPhone,
      to: phone,
    })

    console.log(`Email OTP: ${emailOtp}, Phone OTP: ${phoneOtp}`)
    res.status(200).json({ message: 'OTP sent to email and phone.' })
  } catch (error) {
    console.error('Error sending OTP:', error)
    res.status(500).json({ message: 'Server error while sending OTP.' })
  }
})

// Verify OTP
app.post('/verify-otp', async (req, res) => {
  const { email, phone, otp, type } = req.body // 'type' indicates whether verifying email or phone OTP

  if (!email || !phone || !otp || !type) {
    return res.status(400).json({ message: 'Email, phone, OTP, and type are required.' })
  }

  try {
    const users = await readUsers()
    const user = users.find((u) => u.email === email && u.phone === phone)

    if (!user) {
      return res.status(404).json({ message: 'User not found.' })
    }

    if (Date.now() > user.otpExpiry) {
      return res.status(400).json({ message: 'OTP has expired.' })
    }

    if (type === 'email' && otp === user.emailOtp) {
      user.emailVerified = true
      user.emailOtp = null // Clear email OTP
    } else if (type === 'phone' && otp === user.phoneOtp) {
      user.phoneVerified = true
      user.phoneOtp = null // Clear phone OTP
    } else {
      return res.status(400).json({ message: 'Invalid OTP.' })
    }

    await writeUsers(users)

    res.status(200).json({
      message: `${type.charAt(0).toUpperCase() + type.slice(1)} OTP verified successfully.`,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
    })
  } catch (error) {
    console.error('Error verifying OTP:', error)
    res.status(500).json({ message: 'Server error while verifying OTP.' })
  }
})

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})
