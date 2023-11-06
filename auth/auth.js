const OTPgen = require("otp-generator")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const { v4: uuid } = require("uuid")
const { emailOTP } = require("../services/emailService")
const secretkey = "voldemort"

const OTPstore = new Map()

const createUserToken = (user) => {
  const accessToken = jwt.sign(
    { email: user.email, token_id: uuid() },
    secretkey
  )
  return accessToken
}

const validateUserToken = (req, res, next) => {
  try {
    const accessToken = req.cookies?.user
    const validToken = jwt.verify(accessToken, secretkey)
    req.user = validToken
    next()
  } catch (err) {
    return res.json({ error: err, status: 300 })
  }
}

const getOTP = (email) => {
  const from = "todolistmail23@gmail.com"
  const to = email
  const subject = "OTP for password reset"
  const OTP = OTPgen.generate(6, {
    upperCaseAlphabets: true,
    specialChars: true,
  })
  const salt = bcrypt.genSalt(10)
  const hashedOTP = bcrypt.hash(OTP, salt)
  OTPstore.set(email, hashedOTP)
  setTimeout((email) => {
    OTPstore.delete(email)
  }, 60 * 5 * 1000)
  const text = "Your OTP is " + OTP + " .Your OTP will be valid for 5 minutes."
  emailOTP(from, to, subject, text)
}

const verifyOTP = (email, OTP) => {
  const hashedOTP = OTPstore.get(email)
  return bcrypt.compare(OTP, hashedOTP)
}

module.exports = { createUserToken, validateUserToken, getOTP, verifyOTP }
