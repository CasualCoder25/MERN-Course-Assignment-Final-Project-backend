const mongoose = require("mongoose")
const express = require("express")
const taskRoutes = express.Router()
const TasksSchema = require("../models/TasksSchema")
const { deleteTimeoutEmail, emailService } = require("../services/emailService")
const getTimeout = require("../services/getTimeout")

// PENDING-TASKS
taskRoutes.get("/pending-tasks", (req, res) => {
  const email = req.user.email
  TasksSchema.find({ user_email_id: email, completed: false }, (err, data) => {
    if (err) {
      console.log(err)
      res.json({ error: err, status: 500 })
    } else {
      res.json(data)
    }
  })
})

// COMPLETED-TASKS
taskRoutes.get("/completed-tasks", (req, res) => {
  const email = req.user.email
  TasksSchema.find({ user_email_id: email, completed: true }, (err, data) => {
    if (err) {
      console.log(err)
      res.json({ error: err, status: 500 })
    } else {
      res.json(data)
    }
  })
})

// CREATE-TASK AND OPITIONAL EMAIL-REMINDER
taskRoutes.post("/create-task", (req, res) => {
  let {
    user_email_id,
    task_name,
    task_description,
    star,
    priority_number,
    reminder_active,
    reminder_time,
    completed,
  } = req.body
  const subject = "Reminder for task " + task_name
  const text = "Your task " + task_name + " is due at " + reminder_time + "."
  const valid = inputTaskValidator(
    task_id,
    user_email_id,
    task_name,
    task_description,
    star,
    priority_number,
    reminder_active,
    reminder_time,
    completed
  )
  if (valid) {
    if (completed || !reminder_time) {
      reminder_active = false
    }
    const task = {
      user_email_id: user_email_id,
      task_name: task_name,
      task_description: task_description,
      star: star,
      priority_number: priority_number,
      reminder_active: reminder_active,
      reminder_time: reminder_time,
      completed: completed,
    }
    TasksSchema.create(task, (err, data) => {
      if (err) {
        res.json({ error: err, status: 500 })
      } else {
        const task_id = data._id
        const from = "todolistmail23@gmail.com"
        if (reminder_active) {
          const timeout = getTimeout(reminder_time)
          if (timeout > 0) {
            emailService(from, user_email_id, subject, text, task_id, timeout)
          }
        }
        res.json({ message: "Success" })
      }
    })
  } else {
    res.json({ error: "Invalid input data", status: 500 })
  }
})

// EDIT-TASK
taskRoutes.put("/edit-task", (req, res) => {
  let {
    task_id,
    user_email_id,
    task_name,
    task_description,
    star,
    priority_number,
    reminder_active,
    reminder_time,
    completed,
  } = req.body
  const subject = "Reminder for task " + task_name
  const text = "Your task " + task_name + " is due at " + reminder_time + "."
  const valid = inputTaskValidator(
    task_id,
    user_email_id,
    task_name,
    task_description,
    star,
    priority_number,
    reminder_active,
    reminder_time,
    completed
  )
  if (valid) {
    if (completed || !reminder_time) {
      reminder_active = false
    }
    const task = {
      user_email_id: user_email_id,
      task_name: task_name,
      task_description: task_description,
      star: star,
      priority_number: priority_number,
      reminder_active: reminder_active,
      reminder_time: reminder_time,
      completed: completed,
    }
    TasksSchema.findByIdAndUpdate(
      mongoose.Types.ObjectId(task_id),
      {
        $set: task,
      },
      (err, data) => {
        if (err) {
          res.json({ error: err, status: 500 })
        } else {
          const from = "todolistmail23@gmail.com"
          deleteTimeoutEmail(user_email_id, task_id)
          if (reminder_active) {
            const timeout = getTimeout(reminder_time)
            if (timeout > 0) {
              emailService(from, user_email_id, subject, text, task_id, timeout)
            }
          }
          res.json({ message: "Success" })
        }
      }
    )
  } else {
    res.json({ error: "Invalid input data", status: 500 })
  }
})

// DELETE-TASKS
taskRoutes.delete("/delete-task", (req, res) => {
  const { user_email_id, task_id } = req.body
  deleteTimeoutEmail(user_email_id, task_id)
  TasksSchema.findByIdAndRemove(
    mongoose.Types.ObjectId(task_id),
    (err, data) => {
      if (err) {
        console.log(err)
        res.json({ error: err, status: 500 })
      } else {
        res.json({ message: "Success" })
      }
    }
  )
})

// VERIFY-IFVALID
const inputTaskValidator = (
  task_id,
  user_email_id,
  task_name,
  task_description,
  star,
  priority_number,
  reminder_active,
  reminder_time,
  completed
) => {
  if (
    task_id === undefined ||
    user_email_id === undefined ||
    task_name === undefined ||
    task_description === undefined ||
    star === undefined ||
    priority_number === undefined ||
    reminder_active === undefined ||
    reminder_time === undefined ||
    completed === undefined
  ) {
    return false
  } else if (
    task_id === null ||
    user_email_id === null ||
    task_name === null ||
    task_description === null ||
    star === null ||
    priority_number === null ||
    reminder_active === null ||
    reminder_time === null ||
    completed === null
  ) {
    return false
  } else {
    return true
  }
}

module.exports = taskRoutes
