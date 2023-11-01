const nodemailer = require("nodemailer")

let mailTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "username",
    pass: "password",
  },
})

module.exports = mailTransporter
