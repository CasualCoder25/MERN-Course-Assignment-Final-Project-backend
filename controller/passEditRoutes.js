const mongoose = require("mongoose")
const express = require("express")
const bcrypt = require("bcrypt")
const passEditRoutes = express.Router()
const UserSchema = require("../models/UserSchema")
const { createUserToken, getOTP, verifyOTP } = require("../auth/auth")

// SEND-FORGOT-PASSWORD-OTP
passEditRoutes.post("/send-fp-otp", (req, res) => {
  const { email } = req.body
  getOTP(email)
})

// RESET-PASSWORD
passEditRoutes.put("/reset-pass", async (req, res) => {
  const { email, OTP, newPassword } = req.body
  const match = verifyOTP(email, OTP)
  if (match) {
    UserSchema.findOne({ email: email }, (err, data) => {
      if (err) {
        res.json({ error: "Unable to fetch user", status: 500 })
      } else {
        const userUpdated = { password: newPassword }
        UserSchema.findByIdAndUpdate(
          mongoose.Types.ObjectId(user._id),
          { $set: userUpdated },
          (err, data) => {
            if (err) {
              console.log(err)
              res.json({ error: err, status: 500 })
            } else {
              res.json({ message: "Success" })
            }
          }
        )
      }
    })
  } else {
    res.json({ error: "Invalid OTP", status: 500 })
  }
})

module.exports = passEditRoutes
