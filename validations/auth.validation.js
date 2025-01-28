const Joi = require("joi");

class AuthValidation {
  async registerValidate(body) {
    return new Promise(async (resolve, reject) => {
      const schema = Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().trim().required(),
        password: Joi.string().trim().min(3).max(20).required(),
      });

      try {
        await schema.validateAsync(body);
        resolve();
      } catch (error) {
        console.log("🚀 ~ AuthValidation ~ returnnewPromise ~ error:", error);
        reject(error.message);
      }
    });
  }

  async loginValidate(body) {
    return new Promise(async (resolve, reject) => {
      const schema = Joi.object({
        email: Joi.string().email().trim().required(),
        password: Joi.string().trim().min(3).max(20).required(),
      });

      try {
        await schema.validateAsync(body);
        resolve();
      } catch (error) {
        console.log("🚀 ~ AuthValidation ~ returnnewPromise ~ error:", error);
        reject(error.message);
      }
    });
  }
}

module.exports = new AuthValidation();
