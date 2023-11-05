const mongoose = require("mongoose")
const express = require("express")
const taskRoutes = express.Router()
const TasksSchema = require("../models/TasksSchema")
const { deleteTimeoutEmail, emailService } = require("../services/emailService")
const getTimeout = require("../services/getTimeout")

// PENDING-TASKS
taskRoutes.get("/pending-tasks", async (req, res) => {
  const email = req.user.email
  await TasksSchema.find(
    { user_email_id: email, completed: false },
    (err, data) => {
      if (err) {
        console.log(err)
        res.json({ error: err, status: 500 })
      } else {
        res.json(data)
      }
    }
  )
})

// COMPLETED-TASKS
taskRoutes.get("/competed-tasks", async (req, res) => {
  const email = req.user.email
  await TasksSchema.find(
    { user_email_id: email, completed: true },
    (err, data) => {
      if (err) {
        console.log(err)
        res.json({ error: err, status: 500 })
      } else {
        res.json(data)
      }
    }
  )
})

// CREATE-TASK AND OPITIONAL EMAIL-REMINDER
taskRoutes.post("/create-task", (req, res) => {
  const {
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
  TasksSchema.create(task)
    .then((data) => {
      const email = data.user_email_id
      const task_id = data._id
      const reminder_active = data.reminder_active
      const from = "todolistmail23@gmail.com"
      if (reminder_active) {
        const timeout = getTimeout(reminder_time)
        if (timeout > 0) {
          emailService(from, email, subject, text, task_id, timeout)
        }
      }
      res.json({ message: "Success" })
    })
    .catch((err) => {
      res.json({ error: err, status: 500 })
    })
})

// EDIT-TASK
taskRoutes.put("/edit-task", (req, res) => {
  const {
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
  deleteTimeoutEmail(user_email_id, task_id)
  TasksSchema.findByIdAndUpdate(mongoose.Types.ObjectId(task_id), {
    $set: task,
  })
    .then((data) => {
      const email = data.user_email_id
      const task_id = data._id
      const reminder_active = data.reminder_active
      const from = "todolistmail23@gmail.com"
      if (reminder_active) {
        const timeout = getTimeout(reminder_time)
        if (timeout > 0) {
          emailService(from, email, subject, text, task_id, timeout)
        }
      }
      res.json({ message: "Success" })
    })
    .catch((err) => {
      res.json({ error: err, status: 500 })
    })
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

module.exports = taskRoutes
