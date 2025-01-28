const jwt = require("jsonwebtoken");
const models = require("../models/indexModel");
const User = models.userModel;

class AuthMiddleware {
  /**
   * Validate user
   * @param {*} req
   * @param {*} res
   * @param {*} next
   * @returns
   */
  async validateUser(req, res, next) {
    try {
      const authorization = req.headers["authorization"];

      const token = authorization?.replace("Bearer ", "");

      const user = jwt.verify(token, process.env.JWT_SECRET_KEY);

      const isUserExist = await User.findOne({ where: { email: user.email } });

      if (!isUserExist) {
        return res.status(400).json({ message: "User not found!" });
      }

      req.user = user;
      next();
    } catch (error) {
      console.log("🚀 ~ AuthMiddleware ~ validateUser ~ error:", error);
      return res.status(401).json({ message: error.message });
    }
  }

  /**
   * Validate socket request
   * @param {*} socket
   * @param {*} next
   * @returns
   */
  async validateSocket(socket, next) {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error("Token not provided!"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

      socket.user = decoded;

      next();
    } catch (error) {
      console.log("🚀 ~ AuthMiddleware ~ validateSocket ~ error:", error);
      next(new Error("Authentication error: Invalid token"));
    }
  }
}

module.exports = new AuthMiddleware();
