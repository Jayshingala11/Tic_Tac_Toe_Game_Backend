const express = require("express");
const http = require("http");
require("dotenv").config();
const port = parseInt(process.env.NODE_PORT);
const bodyParser = require("body-parser");
const dbConnection = require("./database/db.config");
const indexRoute = require("./routes/index.route");
const GameController = require("./controllers/gameRoom.controller");
const AuthMiddleware = require("./middlewares/auth.middleware");
const { Server } = require("socket.io");
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const models = require("./models/indexModel");

(async () => {
  try {
    await dbConnection.authenticate();
    console.log("database connection established successfully!");

    await dbConnection.sync({ alter: true, force: false });
  } catch (error) {
    console.log("🚀 ~ database connection error:", error);
  }
})();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(indexRoute);

io.use(AuthMiddleware.validateSocket); // Authenticate socket.io

io.on("connection", async (socket) => {
  console.log("A user connected", socket.id);

  // Handle game logic
  await GameController.handleGame(socket, io);

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
  });
});

module.exports = { io };

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
