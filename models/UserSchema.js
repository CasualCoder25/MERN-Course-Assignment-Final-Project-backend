const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
  },
  {
    collection: "users",
  }
)

UserSchema.pre("save", async function (next) {
  try {
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(this.password, salt)
    this.password = hashedPassword
    next()
  } catch (error) {
    console.log(error)
  }
})

module.exports = mongoose.model("UserSchema", UserSchema)
