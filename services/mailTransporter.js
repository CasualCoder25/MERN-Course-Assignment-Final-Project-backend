const nodemailer = require("nodemailer")

let mailTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "todolistmail23@gmail.com",
    pass: "nnfz ztzz vcmt iuzx",
  },
})

module.exports = mailTransporter
