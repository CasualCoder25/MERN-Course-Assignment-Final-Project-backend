const mongoose = require("mongoose")
const TasksSchema = mongoose.Schema(
  {
    user_email_id: { type: String, required: true },
    tasks: { type: Array, required: true },
  },
  {
    collection: "tasks",
  }
)

module.exports = mongoose.model("TasksSchema", TasksSchema)
