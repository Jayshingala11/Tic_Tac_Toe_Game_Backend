const { DataTypes } = require("sequelize");
const dbConnection = require("../database/db.config");

const Game = dbConnection.define("games", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  roomId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  boardState: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: JSON.stringify([
      ["", "", ""],
      ["", "", ""],
      ["", "", ""],
    ]),
  },
  currentPlayer: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  winner: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false,
  },
  deletedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
});

Game.associate = (models) => {
  Game.belongsTo(models.RoomModel, {
    foreignKey: "roomId",
  });
  Game.belongsTo(models.userModel, {
    foreignKey: "currentPlayer",
  });
  Game.belongsTo(models.userModel, {
    foreignKey: "winner",
  })
};

module.exports = Game;
