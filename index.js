const mongoose = require("mongoose")
const cors = require("cors")
const bodyparser = require("body-parser")
const cookieparser = require("cookie-parser")
const express = require("express")
const userCreateRoutes = require("./controller/userCreateRoutes")
const userEditRoutes = require("./controller/userEditRoutes")
const passEditRoutes = require("./controller/passEditRoutes")
const taskRoutes = require("./controller/taskRoutes")
const feedbackRoutes = require("./controller/feedbackRoute")
const sleepPreventRoutes = require("./controller/sleepPreventerRoute")
const { validateUserToken } = require("./auth/auth")
const rebootemailService = require("./services/emailService").rebootemailService
const sleepPreventer = require("./services/sleepPreventer")

// MongoDB Atlas Connection
mongoose.set("strictQuery", true)
mongoose
  .connect(
    "mongodb+srv://todolistmail23:usersTask12345@todocluster.3mr9jur.mongodb.net/todolist"
  )
  .catch((error) => console.log(error))
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
app.set("trust proxy", 1)

// Middlewares
app.use(bodyparser.json())
app.use(bodyparser.urlencoded({ extended: true }))
app.use(
  cors({
    origin: [
      "https://mern-final-project-frontend.vercel.app",
      "https://mern-final-project-frontend-git-main-sagar-ss-projects.vercel.app",
      "https://mern-final-project-frontend-sagar-ss-projects.vercel.app",
      "https://13.228.225.19",
      "https://18.142.128.26",
      "https://54.254.162.138",
    ],
    credentials: true,
  })
)
app.use(cookieparser())

// Sleep Prevent Route
app.use("/sleep-prevent", sleepPreventRoutes)
// User Feedback
app.use("/feedback", feedbackRoutes)
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

// Sleep Preventer
sleepPreventer()
