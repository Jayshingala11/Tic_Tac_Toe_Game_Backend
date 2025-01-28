const GameRoomValidation = require("../validations/gameRoom.validation");
const GameRoomHelper = require("../helpers/gameRoomHelper");
const Models = require("../models/indexModel");
const { Sequelize, Op } = require("sequelize");
const Room = Models.RoomModel;
const Game = Models.gameModel;
const Player = Models.playerModel;
const User = Models.userModel;
const { io } = require("../index");

class GameRoomController {
  /**
   * Create room
   * @param {*} req
   * @param {*} res
   * @returns
   */
  async createRoom(req, res) {
    try {
      await GameRoomValidation.createGameRoomValidate(req.body);

      const { roomName, isPrivate } = req.body;

      let joinCode = null;
      if (isPrivate) {
        joinCode = GameRoomHelper.generateRandomString(12);
      }

      await Room.create({
        roomName,
        createdBy: req.user.id,
        isPrivate,
        joinCode,
      });

      return res.status(200).json({ message: "Room created successfully!" });
    } catch (error) {
      console.log("🚀 ~ GameRoomController ~ createRoom ~ error:", error);
      return res
        .status(400)
        .json({ message: error || "something went wrong!" });
    }
  }

  /**
   * Join room
   * @param {*} req
   * @param {*} res
   * @returns
   */
  async joinRoom(req, res) {
    try {
      await GameRoomValidation.JoinRoomValidate(req.body);

      const { roomId, joinCode } = req.body;

      const isRoomExist = await Room.findOne({
        where: { id: roomId },
      });

      if (!isRoomExist) {
        return res.status(404).json({ message: "Room not found!" });
      }

      if (isRoomExist.isPrivate && !joinCode) {
        return res.status(400).json({ message: "Join code must be provided!" });
      }

      if (isRoomExist.isPrivate && isRoomExist.joinCode !== joinCode) {
        return res.status(400).json({ message: "Invalid join code!" });
      }

      res.status(200).json({ message: "Room joined!", room: isRoomExist });
    } catch (error) {
      console.log("🚀 ~ GameRoomController ~ joinRoom ~ error:", error);
      return res
        .status(400)
        .json({ message: error || "something went wrong!" });
    }
  }

  /**
   * List all public rooms
   * @param {*} req
   * @param {*} res
   * @returns
   */
  async listAllPublicRoom(req, res) {
    try {
      const publicRooms = await Room.findAll({
        where: { isPrivate: false, isActive: true },
      });
      console.log(
        "🚀 ~ GameRoomController ~ listAllPublicRoom ~ publicRooms:",
        publicRooms
      );

      return res
        .status(200)
        .json({ message: "Public rooms fetched!", rooms: publicRooms });
    } catch (error) {
      console.log(
        "🚀 ~ GameRoomController ~ listAllPublicRoom ~ error:",
        error
      );
      return res
        .status(400)
        .json({ message: error || "something went wrong!" });
    }
  }

  /**
   * Handle the whole game logic
   * @param {*} socket 
   * @param {*} io 
   */
  async handleGame(socket, io) {
    /**
     * Handle join room
     */
    socket.on("join-room", async ({ roomId }) => {
      try {
        console.log("User :::", socket.user);
        const playerId = socket.user.id;

        console.log(
          "🚀 ~ GameRoomController ~ socket.on ~ playerId:",
          playerId
        );
        const room = await Room.findByPk(roomId);
        console.log("🚀 ~ GameRoomController ~ socket.on ~ room:", room);

        if (!room) {
          socket.emit("error", { message: "Room not found" });
          return;
        }

        socket.join(roomId);
        let roomPlayer = await Player.findAll({ where: { roomId } });

        if (roomPlayer?.length <= 2) {
          await Player.create({
            roomId: room.id,
            playerId,
          });

          roomPlayer = await Player.findAll({ where: { roomId } });

          if (roomPlayer?.length >= 2) {
            const game = await Game.create({
              roomId: room.id,
              currentPlayer: playerId,
            });

            io.to(roomId).emit("game-started", {
              message: "Game started!",
              gameId: game.id,
              players: roomPlayer.map((p) => p.playerId),
              boardState: game.boardState,
            });
            return;
          }
          socket.emit("room-joined", {
            message: `Joined room: ${room.roomName}`,
          });
          return;
        }
      } catch (error) {
        console.log("🚀 ~ GameRoomController ~ socket.on ~ error:", error);
        socket.emit("error", { message: error.message });
      }
    });

    /**
     * Handle player move
     */
    socket.on("player-move", async ({ gameId, move }) => {
      try {
        const playerId = socket.user.id;
        console.log(gameId, playerId, move);

        const game = await Game.findByPk(gameId);

        if (!game) {
          socket.emit("error", { message: "Game not found!" });
          return;
        }

        if (game.currentPlayer !== playerId) {
          socket.emit("error", { message: "Not your turn!" });
          return;
        }

        const board = JSON.parse(game.boardState);
        const [row, col] = move;

        if (board[row][col] !== "") {
          socket.emit("error", { message: "Invalid move!" });
          return;
        }

        const roomPlayer = await Player.findAll({
          where: { roomId: game.roomId },
        });

        board[row][col] = playerId;
        game.boardState = JSON.stringify(board);
        game.currentPlayer = [...roomPlayer].find(
          (p) => p.playerId !== playerId
        )?.playerId;

        await game.save();

        const result = this.checkResult(board);

        if (result === "win") {
          game.winner = playerId;
          await game.save();

          const winner = await User.findByPk(playerId); // winner track
          winner.wins += 1;
          await winner.save();

          await User.update(
            { where: { id: game.currentPlayer } },
            { losses: Sequelize.literal("losses + 1") }
          ); // looser track

          io.to(game.roomId).emit("game-end", { winner: playerId });
          return;
        } else if (result === "draw") {
          io.to(game.roomId).emit("game-end", { winner: "draw" });
          return;
        } else {
          io.to(game.roomId).emit("update-board", {
            boardState: board,
            currentPlayer: game.currentPlayer,
          });
          return;
        }
      } catch (error) {
        console.log("🚀 ~ GameRoomController ~ socket.on ~ error:", error);
        socket.emit("error", { message: error.message });
      }
    });
  }

  /**
   * Check game result
   * @param {*} board
   * @returns
   */
  checkResult(board) {
    const winningCombinations = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8], // Rows
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8], // Columns
      [0, 4, 8],
      [2, 4, 6], // Diagonals
    ];

    for (const combo of winningCombinations) {
      const [a, b, c] = combo;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return "win";
      }
    }

    if (board.flat().every((cell) => cell !== "")) {
      return "draw";
    }

    return null;
  }

  /**
   * List top 10 users
   * @param {*} req 
   * @param {*} res 
   * @returns 
   */
  async listTopTenPlayers(req, res) {
    try {
      const topTenUsers = await User.findAll({
        attributes: ["id", "name", "wins", "losses"],
        order: [["wins", "DESC"]],
        limit: 10,
      });

      return res
        .status(200)
        .json({ message: "Top ten players fetched!", topTenUsers });
    } catch (error) {
      console.log(
        "🚀 ~ GameRoomController ~ listTopTenPlayers ~ error:",
        error
      );
      return res
        .status(400)
        .json({ message: error || "something went wrong!" });
    }
  }
}

module.exports = new GameRoomController();
