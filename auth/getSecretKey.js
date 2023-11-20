const getSecretKey = (Date) => {
  return (
    process.env["secret_key"] +
    Date.getMonth() +
    "-" +
    Date.getDate() +
    "-" +
    Date.getFullYear()
  )
}

module.exports = getSecretKey