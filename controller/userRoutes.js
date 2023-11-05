const mongoose = require("mongoose")
const express = require("express")
const bcrypt = require("bcrypt")
const userRoutes = express.Router()
const UserSchema = require("../models/UserSchema")
const {
  createUserToken,
  validateUserToken,
  getOTP,
  verifyOTP,
} = require("../auth/auth")

//SIGNUP
userRoutes.post("/signup", (req, res) => {
  const { name, email, password } = req.body
  UserSchema.create(
    {
      name: name,
      email: email,
      password: password,
    },
    (err, data) => {
      if (err) {
        res.json({ message: "Success" })
      } else {
        res.json({ error: err })
      }
    }
  )
})

//LOGIN
userRoutes.post("/login", async (req, res) => {
  const { email, password } = req.body
  UserSchema.findOne({ email: email }, (err, user) => {
    if (err) {
      res.json({ error: "Unable to fetch user", status: 500 })
    } else {
      if (!user) {
        res.json({ error: "User does not exist", status: 500 })
      }
      const hashedPassword = user.password
      bcrypt
        .compare(password, hashedPassword)
        .then((match) => {
          if (match) {
            const accessToken = createUserToken({ email: email })
            res.cookie("user", accessToken, {
              maxAge: 60 * 60 * 24 * 1000,
            })
            res.json({ message: "Success" })
          } else {
            res.json({ error: "Invalid credentials", status: 500 })
          }
        })
        .catch((err) => {
          console.log(err)
          res.json({ error: "Failed", status: 500 })
        })
    }
  })
})

// EDIT-USER
userRoutes.put("/edit-user", validateUserToken, async (req, res) => {
  const { password, newName, newPassword } = req.body
  const email = req.user.email
  const user = await UserSchema.findOne({ email: email }, (err, data) => {
    if (err) {
      res.json({ error: "Unable to fetch user", status: 500 })
    } else {
      return data
    }
  })
  if (!user) {
    res.json({ error: "User does not exist", status: 500 })
  }
  newName = newName ? newName : user.name
  newPassword = newPassword ? newPassword : password
  const userUpdated = { name: newName, password: newPassword }
  const hashedPassword = user.password
  bcrypt
    .compare(password, hashedPassword)
    .then(async (match) => {
      if (match) {
        const user = await UserSchema.findByIdAndUpdate(
          mongoose.Types.ObjectId(user._id),
          { $set: userUpdated },
          (err, data) => {
            if (err) {
              res.json({ error: "Unable to fetch user", status: 500 })
            } else {
              return data
            }
          }
        )
        const accessToken = createUserToken({ email: user.email })
        res.cookie("user", accessToken, {
          maxAge: 60 * 60 * 24 * 1000,
        })
        res.json({ message: "Success" })
      } else {
        res.json({ error: "Invalid credentials", status: 500 })
      }
    })
    .catch((err) => {
      console.log(err)
      res.json({ error: "Failed", status: 500 })
    })
})

// DELETE-USER
userRoutes.delete("/delete-user", validateUserToken, async (req, res) => {
  const { password } = req.body
  const email = req.user.email
  const user = await UserSchema.findOne({ email: email }, (err, data) => {
    if (err) {
      res.json({ error: "Unable to fetch user", status: 500 })
    } else {
      return data
    }
  })
  if (!user) {
    res.json({ error: "User does not exist", status: 500 })
  }
  const hashedPassword = user.password
  bcrypt
    .compare(password, hashedPassword)
    .then((match) => {
      if (match) {
        UserSchema.findByIdAndDelete(
          mongoose.Types.ObjectId(user._id),
          (err, data) => {
            if (err) {
              console.log(err)
              res.json({ error: err, status: 500 })
            } else {
              res.cookie("user", {})
              res.json({ message: "Success" })
            }
          }
        )
      } else {
        res.json({ error: "Invalid credentials", status: 500 })
      }
    })
    .catch((err) => {
      console.log(err)
      res.json({ error: "Failed", status: 500 })
    })
})

// SEND-FORGOT-PASSWORD-OTP
userRoutes.post("/send-fp-otp", (req, res) => {
  const { email } = req.body
  getOTP(email)
})

// RESET-PASSWORD
userRoutes.put("/reset-pass", async (req, res) => {
  const { email, OTP, newPassword } = req.body
  const match = verifyOTP(email, OTP)
  if (match) {
    const user = await UserSchema.findOne({ email: email }, (err, data) => {
      if (err) {
        res.json({ error: "Unable to fetch user", status: 500 })
      } else {
        return data
      }
    })
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
  } else {
    res.json({ error: "Invalid OTP", status: 500 })
  }
})

module.exports = userRoutes
