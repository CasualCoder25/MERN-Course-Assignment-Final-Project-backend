const mongoose = require("mongoose")
const express = require("express")
const bcrypt = require("bcrypt")
const passEditRoutes = express.Router()
const UserSchema = require("../models/UserSchema")
const { getOTP, verifyOTP } = require("../auth/auth")

// SEND-FORGOT-PASSWORD-OTP
passEditRoutes.post("/send-fp-otp", (req, res) => {
  const { email } = req.body
  UserSchema.findOne({ email: email }, (err, user) => {
    if (err) {
      res.json({ error: err, status: 500 })
    } else {
      if (!user) {
        res.json({ error: "User not found", status: 500 })
      } else {
        getOTP(email)
        res.json({ message: "Success" })
      }
    }
  })
})

// RESET-PASSWORD
passEditRoutes.put("/reset-pass", (req, res) => {
  const { email, OTP, newPassword } = req.body
  UserSchema.findOne({ email: email }, async (err, user) => {
    if (err) {
      res.json({ error: "Unable to fetch user", status: 500 })
    } else {
      if (!user) {
        res.json({ error: "User not found", status: 500 })
      } else {
        const match = await verifyOTP(email, OTP)
        if (match) {
          const userUpdated = { password: newPassword }
          UserSchema.findByIdAndUpdate(
            mongoose.Types.ObjectId(user._id),
            { $set: userUpdated },
            (err, data) => {
              if (err) {
                res.json({ error: err, status: 500 })
              } else {
                res.json({ message: "Success" })
              }
            }
          )
        } else {
          res.json({ error: "Invalid OTP", status: 500 })
        }
      }
    }
  })
})

module.exports = passEditRoutes
