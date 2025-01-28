const express = require("express");
const GameRoomController = require("../controllers/gameRoom.controller");
const AuthMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

router.post(
  "/create-room",
  AuthMiddleware.validateUser,
  GameRoomController.createRoom
);

router.get(
  "/get-rooms",
  AuthMiddleware.validateUser,
  GameRoomController.listAllPublicRoom
);

router.get(
  "/get-top-users",
  AuthMiddleware.validateUser,
  GameRoomController.listTopTenPlayers
);

module.exports = router;
