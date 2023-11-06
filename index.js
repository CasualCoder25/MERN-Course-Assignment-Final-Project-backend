const mongoose = require("mongoose")
const cors = require("cors")
const bodyparser = require("body-parser")
const cookieparser = require("cookie-parser")
const express = require("express")
const userCreateRoutes = require("./controller/userCreateRoutes")
const userEditRoutes = require("./controller/userEditRoutes")
const passEditRoutes = require("./controller/passEditRoutes")
const taskRoutes = require("./controller/taskRoutes")
const { validateUserToken } = require("./auth/auth")
const rebootemailService = require("./services/emailService").rebootemailService

// MongoDB Atlas Connection
mongoose.set("strictQuery", true)
mongoose.connect("mongodb://127.0.0.1:27017/todolist")
var db = mongoose.connection
db.on("open", () => {
  // Connected to DB
  console.log("Connected to DB")
  // Reboot Email Service
  rebootemailService()
})
db.on("error", () => console.log("Not Connected to DB"))

// Creating middlewares using express
const app = express()

// Middlewares
app.use(bodyparser.json())
app.use(bodyparser.urlencoded({ extended: true }))
app.use(cors())
app.use(cookieparser())

// User Edit Routes
app.use("/user-create", userCreateRoutes)
// Password Edit Routes
app.use("/pass-edit", passEditRoutes)
// User Create Routes
app.use("/user-edit", validateUserToken, userEditRoutes)
// Task Routes
app.use("/task", validateUserToken, taskRoutes)

// Listening to a port number
app.listen(8000, () => console.log("Server started at 8000"))
