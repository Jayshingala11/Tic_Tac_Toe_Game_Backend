const express = require('express');
const AuthRoute = require('./auth.route');
const GameRoomRoute = require('./gameRoom.route');

const router = express.Router();

router.use('/auth', AuthRoute);

router.use('/game-room', GameRoomRoute);


module.exports = router;