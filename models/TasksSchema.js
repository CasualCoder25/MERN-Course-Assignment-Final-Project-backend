const mongoose = require("mongoose")
const TasksSchema = mongoose.Schema(
  {
    user_email_id: { type: String, required: true, index: true },
    task_name: { type: String, required: true },
    task_description: { type: String },
    star: { type: Boolean, required: true },
    priority_number: { type: Number, required: true },
    reminder_active: { type: Boolean, required: true, index: true },
    reminder_time: { type: String },
    completed: { type: Boolean, required: true },
  },
  {
    collection: "tasks",
  }
)

module.exports = mongoose.model("TasksSchema", TasksSchema)
