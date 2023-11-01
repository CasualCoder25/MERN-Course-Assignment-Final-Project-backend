const jwt = require("jsonwebtoken")
const secretkey = "voldemort"

const createUserToken = (user) => {
  const accessToken = jwt.sign({ email: user.email }, secretkey)
  return accessToken
}

const validateUserToken = (req, res, next) => {
  try {
    const accessToken = req.cookies?.user
    const validToken = jwt.verify(accessToken, secretkey)
    req.user = validToken
    next()
  } catch (err) {
    return res.json({ error: err, status: 300 })
  }
}

module.exports = { createUserToken, validateUserToken }
