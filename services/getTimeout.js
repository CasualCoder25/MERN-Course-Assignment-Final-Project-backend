//time format: "Nov 07 2023 13:35:20"
const getTimeout = (time) => {
  try {
    const current = new Date()
    const remind = new Date(time)
    return remind.getTime() - current.getTime()
  } catch (err) {
    return null
  }
}

module.exports = getTimeout
