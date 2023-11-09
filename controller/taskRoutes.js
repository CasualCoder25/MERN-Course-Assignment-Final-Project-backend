const mongoose = require("mongoose")
const express = require("express")
const taskRoutes = express.Router()
const TasksSchema = require("../models/TasksSchema")
const { deleteTimeoutEmail, emailService } = require("../services/emailService")
const getTimeout = require("../services/getTimeout")
const inputTaskValidator = require("../models/inputTaskValidator")

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
  const user_email_id = req.user.email
  const valid = inputTaskValidator(req.body, user_email_id)
  let {
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
  const user_email_id = req.user.email
  const valid = inputTaskValidator(req.body, user_email_id)
  let {
    task_id,
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
  if (valid && task_id) {
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
    TasksSchema.findById(mongoose.Types.ObjectId(task_id), (err, data) => {
      if (err) {
        res.json({ error: err, status: 500 })
      } else if (data && data.user_email_id === user_email_id) {
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
                  emailService(
                    from,
                    user_email_id,
                    subject,
                    text,
                    task_id,
                    timeout
                  )
                }
              }
              res.json({ message: "Success" })
            }
          }
        )
      } else {
        res.json({ error: "Task not found", status: 500 })
      }
    })
  } else {
    res.json({ error: "Invalid input data", status: 500 })
  }
})

// DELETE-TASKS
taskRoutes.delete("/delete-task", (req, res) => {
  const user_email_id = req.user.email
  const { task_id } = req.body
  if (task_id) {
    deleteTimeoutEmail(user_email_id, task_id)
    TasksSchema.findById(mongoose.Types.ObjectId(task_id), (err, data) => {
      if (err) {
        res.json({ error: err, status: 500 })
      } else if (data && data.user_email_id === user_email_id) {
        TasksSchema.findByIdAndDelete(
          mongoose.Types.ObjectId(task_id),
          (err, data) => {
            if (err) {
              res.json({ error: err, status: 500 })
            } else {
              res.json({ message: "Success" })
            }
          }
        )
      } else {
        res.json({ error: "Task not found", status: 500 })
      }
    })
  } else {
    res.json({ error: "Invalid input data", status: 500 })
  }
})

module.exports = taskRoutes
