//time format: "Nov 07 2023 13:35:20"
const getTimeout = (time) => {
  const current = new Date()
  const remind = new Date(time)
  return remind.getTime() - current.getTime()
}

module.exports = getTimeout
