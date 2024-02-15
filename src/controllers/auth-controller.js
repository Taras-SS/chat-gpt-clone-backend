import UserModel from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { jwtDecode } from "jwt-decode";

export default class Auth {
  constructor() {}

  static async signUp(req, res) {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName) {
      return res.status(400).json({ message: "firstName was not provided" });
    }

    if (!lastName) {
      return res.status(400).json({ message: "lastName was not provided" });
    }

    if (!email) {
      return res.status(400).json({ message: "email was not provided" });
    }

    if (!password) {
      return res.status(400).json({ message: "password was not provided" });
    }

    try {
      const existingUser = await UserModel.findOne({ email: email });
      if (existingUser) {
        return res.status(403).json({
          message: "User with this email address already exists",
        });
      }
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      const user = new UserModel({
        firstName,
        lastName,
        email,
        password: hashedPassword,
      });

      await user.save();
      return res
        .status(201)
        .json({ message: "User has been successfully created" });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  }

  static async signIn(req, res) {
    const { email, password } = req.body;

    if (!email) {
      return res.status(401).json({ message: "email was not provided" });
    }

    if (!password) {
      return res.status(401).json({ message: "password was not provided" });
    }

    try {
      const user = await UserModel.findOne({ email });
      if (!user) {
        return res
          .status(401)
          .json({ message: `User with email: ${email} does not exist` });
      }

      const isPasswordCorrect = await bcrypt.compare(password, user.password);
      if (!isPasswordCorrect) {
        return res.status(401).json({ message: "Password is not correct" });
      }

      const jwtToken = jwt.sign(
        {
          email,
          firstName: user.firstName,
          lastName: user.lastName,
          isAdmin: true,
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" },
      );

      return res.status(200).json({
        firstName: user.firstName,
        lastName: user.lastName,
        email,
        accessToken: jwtToken,
      });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
}
