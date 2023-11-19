//time format: "Nov 07 2023 13:35:20"
const getTimeout = (time) => {
  try {
    console.log(time)
    const current = new Date()
    console.log(current)
    const remind = new Date(time)
    console.log(remind)
    return remind.getTime() - current.getTime()
  } catch (err) {
    return null
  }
}

module.exports = getTimeout
