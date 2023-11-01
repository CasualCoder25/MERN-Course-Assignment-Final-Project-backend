const getTimeout = require("./getTimeout")
const mailTransporter = require("./mailTransporter")
const TasksSchema = require("../models/TasksSchema")

const map = new Map()

const deleteTimeoutEmail = (email, task_index) => {
  const key = email + task_index
  const timeoutID = map.get(key)
  clearTimeout(timeoutID)
  map.delete(key)
}

const emailService = (from, to, subject, text, task_index, timeout) => {
  const timeoutID = setTimeout(() => {
    let mailDetails = {
      from: from,
      to: to,
      subject: subject,
      text: text,
    }
    mailTransporter.sendMail(mailDetails, (err, data) => {
      if (err) {
        console.log("Email not sent...Error - user:" + to + " err:" + err)
      } else {
        console.log("Email sent successfully - user:" + to)
      }
    })
  }, timeout)
  map.set(to + task_index, timeoutID)
}

const rebootemailService = () => {
  TasksSchema.find({})
    .then((data) => {
      for (let i = 0; i < data.length; i++) {
        let user = data[i].user_email_id
        let tasks = data[i].tasks
        let from = "todolistmail23@gmail.com"
        let subject = "Reminder for your task..."

        for (let j = 0; j < tasks.length; j++) {
          if (tasks[j].reminderTime !== null) {
            let text = "Your task " + tasks[j].name + " is still pending"
            let timeout = getTimeout(tasks[j].reminderTime)
            emailService(from, user, subject, text, tasks[j].id, timeout)
          }
        }
      }
    })
    .catch((err) => {
      console.log("Failed to Reboot email Service " + err)
    })
}

module.exports = { emailService, rebootemailService, deleteTimeoutEmail }
