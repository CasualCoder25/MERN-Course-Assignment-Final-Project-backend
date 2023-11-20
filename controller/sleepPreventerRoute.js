const express = require("express")
const sleepPreventRoute = express.Router()

// PENDING-TASKS
sleepPreventRoute.get("/sleep-prevent", (req, res) => {
  res.json({ message: "Success" })
})

module.exports = sleepPreventRoute
