const express = require("express")
const feedbackRoutes = express.Router()
const mailTransporter = require("../services/mailTransporter")

//FEEDBACK
feedbackRoutes.post("/", (req, res) => {
  const { email, description } = req.body
  if (email && description) {
    let mailDetails = {
      from: "todolistmail23@gmail.com",
      to: "todolistmail23@gmail.com",
      subject: email,
      text: description,
    }
    mailTransporter.sendMail(mailDetails, (err, data) => {
      if (err) {
        console.log("Feedback not sent..." + err)
        res.json({ message: err, status: 500 })
      } else {
        console.log("Feedback sent successfully...")
        res.json({ message: "Success" })
      }
    })
  } else {
    res.json({ message: "Invalid Input Data", status: 500 })
  }
})

module.exports = feedbackRoutes
