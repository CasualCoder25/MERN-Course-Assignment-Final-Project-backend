const mongoose = require("mongoose")
const express = require("express")
const bcrypt = require("bcrypt")
const userEditRoutes = express.Router()
const UserSchema = require("../models/UserSchema")
const { createUserToken } = require("../auth/auth")
const TasksSchema = require("../models/TasksSchema")

// EDIT-USER
userEditRoutes.put("/edit-user", (req, res) => {
  let { password, newName, newPassword } = req.body
  const email = req.user.email
  UserSchema.findOne({ email: email }, (err, user) => {
    if (err) {
      res.json({ error: "Unable to fetch user", status: 500 })
    } else {
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
            UserSchema.findByIdAndUpdate(
              mongoose.Types.ObjectId(user._id),
              { $set: userUpdated },
              (err, user) => {
                if (err) {
                  res.json({ error: "Unable to fetch user", status: 500 })
                } else {
                  const accessToken = createUserToken({ email: user.email })
                  res.cookie("user", accessToken, {
                    maxAge: 60 * 60 * 24 * 1000,
                  })
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
    }
  })
})

// DELETE-USER
userEditRoutes.delete("/delete-user", (req, res) => {
  const { password } = req.body
  const email = req.user.email
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
            UserSchema.findByIdAndDelete(
              mongoose.Types.ObjectId(user._id),
              (err, data) => {
                if (err) {
                  res.json({
                    message: "Failed to delete user",
                    error: err,
                    status: 500,
                  })
                } else {
                  res.cookie("user", {})
                  TasksSchema.deleteMany(
                    { user_email_id: email },
                    (err, data) => {
                      if (err) {
                        res.json({
                          message: "Failed to delete user tasks",
                          error: err,
                          status: 500,
                        })
                      } else {
                        res.json({ message: "Success" })
                      }
                    }
                  )
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
    }
  })
})

module.exports = userEditRoutes
