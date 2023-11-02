const getTimeout = require("./getTimeout")
const mailTransporter = require("./mailTransporter")
const TasksSchema = require("../models/TasksSchema")
const mongoose = require("mongoose")

const emailTimeoutMap = new Map()

const deleteTimeoutEmail = (email, task_index) => {
  const key = email + task_index
  const timeoutID = emailTimeoutMap.get(key)
  clearTimeout(timeoutID)
  emailTimeoutMap.delete(key)
  console.log("Email timeout deleted successfully")
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
    emailTimeoutMap.delete(to + task_index)
    console.log("Email timeout deleted successfully")
  }, timeout)
  emailTimeoutMap.set(to + task_index, timeoutID)
}

const rebootemailService = () => {
  const setTaskReminderActiveFalse = (id) => {
    const task = { reminder_active: false }
    TasksSchema.findByIdAndUpdate(
      mongoose.Types.ObjectId(id),
      { $set: task },
      (err, data) => {
        if (err) {
          console.log(err)
        } else {
          console.log("reminder_active set to false - task:" + id)
        }
      }
    )
  }
  TasksSchema.find({ reminder_active: true })
    .then((data) => {
      for (let i = 0; i < data.length; i++) {
        let user = data[i].user_email_id
        let task_name = data[i].task_name
        let from = "todolistmail23@gmail.com"
        let subject = "Reminder for your task..."
        if (data[i].reminder_time) {
          let text = "Your task " + task_name + " is still pending"
          let timeout = getTimeout(data[i].reminder_time)
          if (timeout >= 0) {
            emailService(from, user, subject, text, data[i]._id, timeout)
          } else {
            setTaskReminderActiveFalse(data[i]._id)
          }
        } else {
          setTaskReminderActiveFalse(data[i]._id)
        }
      }
      console.log("Reboot email Service successful")
    })
    .catch((err) => {
      console.log("Failed to Reboot email Service " + err)
    })
}

module.exports = { emailService, rebootemailService, deleteTimeoutEmail }
