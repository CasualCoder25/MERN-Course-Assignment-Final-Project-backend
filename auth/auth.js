const OTPgen = require("otp-generator")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const { v4: uuid } = require("uuid")
const { emailOTP } = require("../services/emailService")
const getSecretKey = require("./getSecretKey")
let secretkey = getSecretKey(new Date())

const refreshSecretKey = () => {
  secretkey = getSecretKey(new Date())
  setTimeout(refreshSecretKey, 24 * 60 * 60 * 1000)
}

const OTPstore = new Map()
refreshSecretKey()

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
    return res.json({ message: "User not logged in", error: err, status: 500 })
  }
}

const getOTP = async (email) => {
  const from = "todolistmail23@gmail.com"
  const to = email
  const subject = "OTP for password reset"
  const OTP = OTPgen.generate(6, {
    upperCaseAlphabets: true,
    specialChars: true,
  })
  const salt = await bcrypt.genSalt(10)
  const hashedOTP = await bcrypt.hash(OTP, salt)
  OTPstore.set(email, hashedOTP)
  setTimeout((email) => {
    OTPstore.delete(email)
  }, 60 * 5 * 1000)
  const text = "Your OTP is " + OTP + " .Your OTP will be valid for 5 minutes."
  emailOTP(from, to, subject, text)
}

const verifyOTP = async (email, OTP) => {
  const hashedOTP = OTPstore.get(email)
  if (hashedOTP && OTP) {
    return await bcrypt.compare(OTP, hashedOTP)
  } else {
    return false
  }
}

module.exports = { createUserToken, validateUserToken, getOTP, verifyOTP }
