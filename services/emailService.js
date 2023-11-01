import getTimeout from "./getTimeout"
const mailTransporter = require("./mailTransporter")
const TasksSchema = require("../models/TasksSchema")
const mongoose = require("mongoose")

const emailService = (from, to, subject, text, timeout) => {
  const timeoutID = setTimeout(() => {
    let mailDetails = {
      from: from,
      to: to,
      subject: subject,
      text: text,
    }
    mailTransporter.sendMail(mailDetails, (err, data) => {
      if (err) {
        console.log("Email not sent...Error - user:" + to)
      } else {
        console.log("Email sent successfully - user:" + to)
      }
    })
  }, timeout)
  return timeoutID
}

const rebootemailService = () => {
  TasksSchema.find((err, data) => {
    if (err) {
      Promise.reject(err)
    } else {
      return data
    }
  })
    .then((data) => {
      for (let i = 0; i < data.length; i++) {
        let ID = data[i]._id
        let user = data[i].user_email_id
        let tasks = data[i].tasks

        let from = "xyz@gmail.com"
        let subject = "Reminder for your task..."

        for (let j = 0; j < tasks.length; j++) {
          if (tasks[j].reminderTime !== null) {
            let text = "Your task " + tasks[j].name + " is still pending"
            let timeout = getTimeout(tasks[j].reminderTime)
            tasks[j].timeoutID = emailService(
              from,
              user,
              subject,
              text,
              timeout
            )
          }
        }

        TasksSchema.findByIDAndUpdate(
          mongoose.Types.ObjectId(ID),
          { $set: { user_email_id: user, tasks: tasks } },
          (err, data) => {
            if (err) {
              console.log("Failed to update DB - user:" + user)
            } else {
              console.log("DB update successful - user:" + user)
            }
          }
        )
      }
    })
    .catch((err) => {
      console.log("Failed to Reboot email Service " + err)
    })
}

module.exports = { emailService, rebootemailService }
