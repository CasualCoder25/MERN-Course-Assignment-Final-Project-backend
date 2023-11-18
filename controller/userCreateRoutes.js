const mongoose = require("mongoose")
const express = require("express")
const bcrypt = require("bcrypt")
const userCreateRoutes = express.Router()
const UserSchema = require("../models/UserSchema")
const { createUserToken } = require("../auth/auth")

//SIGNUP
userCreateRoutes.post("/signup", (req, res) => {
  const { name, email, password } = req.body
  UserSchema.create(
    {
      name: name,
      email: email,
      password: password,
    },
    (err, data) => {
      if (err) {
        res.json({ error: err, status: 500 })
      } else {
        const accessToken = createUserToken({ email: email })
        res.cookie("user", accessToken, {
          secure: true,
          httpOnly: true,
          maxAge: 60 * 60 * 24 * 1000,
        })
        res.json({ message: "Success" })
      }
    }
  )
})

//LOGIN
userCreateRoutes.post("/login", (req, res) => {
  const { email, password } = req.body
  UserSchema.findOne({ email: email }, (err, user) => {
    if (err) {
      res.json({ error: "Unable to fetch user", status: 500 })
    } else {
      if (!user) {
        res.json({ error: "User does not exist", status: 500 })
      } else {
        const hashedPassword = user.password
        bcrypt
          .compare(password, hashedPassword)
          .then((match) => {
            if (match) {
              const accessToken = createUserToken({ email: email })
              res.cookie("user", accessToken, {
                secure: true,
                httpOnly: true,
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
    }
  })
})

//LOGOUT
userCreateRoutes.get("/logout", (req, res) => {
  res.cookie(
    "user",
    {},
    {
      secure: true,
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 1000,
    }
  )
  res.json({ message: "Success" })
})

module.exports = userCreateRoutes
