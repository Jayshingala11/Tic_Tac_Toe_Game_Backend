const { DataTypes } = require("sequelize");
const dbConnection = require("../database/db.config");

const Player = dbConnection.define("players", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  roomId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  playerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
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

Player.associate = (models) => {
  Player.belongsTo(models.RoomModel, {
    foreignKey: "roomId",
  });
  Player.belongsTo(models.userModel, {
    foreignKey: "playerId",
  });
};

module.exports = Player;
