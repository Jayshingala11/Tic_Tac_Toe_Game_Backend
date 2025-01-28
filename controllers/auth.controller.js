const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const models = require("../models/indexModel");
const User = models.userModel;
const AuthValidation = require("../validations/auth.validation");

class AuthController {
  /**
   * User Registration
   * @param {*} req
   * @param {*} res
   * @returns
   */
  async register(req, res) {
    try {
      await AuthValidation.registerValidate(req.body);

      const { name, email, password } = req.body;

      const isUserExist = await User.findOne({ where: { email } });

      if (isUserExist) {
        return res
          .status(400)
          .json({ message: "User with this email is already exist!" });
      }

      const salt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash(password, salt);

      await User.create({
        name,
        email,
        password: hashPassword,
      });

      return res.status(200).json({ message: "User registered successfully" });
    } catch (error) {
      console.log("🚀 ~ AuthController ~ register ~ error:", error);
      return res
        .status(400)
        .json({ message: error || "something went wrong!" });
    }
  }

  /**
   * User Login
   * @param {*} req
   * @param {*} res
   * @returns
   */
  async login(req, res) {
    try {
      console.log("Hello");
      
      await AuthValidation.loginValidate(req.body);

      const { email, password } = req.body;

      const isUserExist = await User.findOne({ where: { email } });

      if (!isUserExist) {
        return res.status(401).json({ message: "Invalid credentials!" });
      }

      const payload = await bcrypt.compare(password, isUserExist.password);

      if (!payload) {
        return res.status(401).json({ message: "Invalid credentials!" });
      }

      const token = jwt.sign(
        { id: isUserExist.id, email },
        process.env.JWT_SECRET_KEY
      );

      return res.status(200).json({ message: "Login successfully!", token });
    } catch (error) {
      console.log("🚀 ~ AuthController ~ login ~ error:", error);
      return res
        .status(400)
        .json({ message: error || "something went wrong!" });
    }
  }
}

module.exports = new AuthController();
