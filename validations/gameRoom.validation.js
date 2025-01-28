const Joi = require("joi");

class GameRoomValidation {
  async createGameRoomValidate(body) {
    return new Promise(async (resolve, reject) => {
      const schema = Joi.object({
        roomName: Joi.string().required(),
        isPrivate: Joi.boolean().required(),
      });

      try {
        await schema.validateAsync(body);
        resolve();
      } catch (error) {
        console.log(
          "🚀 ~ GameRoomValidation ~ returnnewPromise ~ error:",
          error
        );
        reject(error.message);
      }
    });
  }

  async JoinRoomValidate(body) {
    return new Promise(async (resolve, reject) => {
      const schema = Joi.object({
        roomId: Joi.number().required(),
        joinCode: Joi.string().optional(),
      });

      try {
        await schema.validateAsync(body);
        resolve();
      } catch (error) {
        console.log(
          "🚀 ~ GameRoomValidation ~ returnnewPromise ~ error:",
          error
        );
        reject(error.message);
      }
    });
  }
}

module.exports = new GameRoomValidation();
