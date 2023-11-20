const Axios = require("axios")

const sleepPreventer = () => {
  Axios.get(
    "https://mern-final-project-backend.onrender.com/sleep-prevent/sleep-prevent"
  )
    .then((res) => {
      console.log("Success-Refresh")
    })
    .catch((err) => {
      console.log("Failed-Refresh")
    })
  setTimeout(sleepPreventer, 10 * 60 * 1000)
}

module.exports = sleepPreventer
