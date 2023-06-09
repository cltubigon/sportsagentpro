import User from "../models/user.js"
import bcrypt from "bcryptjs"
import { createError } from "../utils/error.js"
import jwt from "jsonwebtoken"

export const register = async (req, res, next) => {
  try {
    const salt = bcrypt.genSaltSync(10)
    const hash = bcrypt.hashSync(req.body.password, salt)

    const newUSer = new User({
      username: req.body.username,
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      email: req.body.email,
      user_type: req.body.user_type,
      phone: req.body.phone,
      password: hash,
    })
    await newUSer.save()
    res.status(200).send("User has been created")
  } catch (err) {
    next(err)
  }
}
export const login = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email })
    if (!user) return next(createError(404, "User not found!"))
    // if (!user) console.log("User not found")

    const isPasswordCorrect = await bcrypt.compare(
      req.body.password,
      user.password
    )
    if (!isPasswordCorrect)
      return next(createError(400, "Wrong password or email"))

    // If password is correct generate token
    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT // Secret Key
    )

    const { password, isAdmin, ...otherDetails } = user._doc
    res.cookie("access_token", token, {
      httpOnly: true,
    }).status(200).json({ ...otherDetails })
  } catch (err) {
    next(err)
  }
}
