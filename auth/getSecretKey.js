const getSecretKey = (Date) => {
  return (
    "voldemort" +
    Date.getMonth() +
    "-" +
    Date.getDate() +
    "-" +
    Date.getFullYear()
  )
}

module.exports = getSecretKey