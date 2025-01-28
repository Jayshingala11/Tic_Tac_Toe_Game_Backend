const { DataTypes } = require("sequelize");
const dbConnection = require("../database/db.config");

const Room = dbConnection.define("rooms", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  roomName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  isPrivate: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  joinCode: {
    type: DataTypes.STRING(12),
    allowNull: true,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
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

Room.associate = (models) => {
  Room.belongsTo(models.userModel, {
    foreignKey: "createdBy",
  });
  Room.hasMany(models.gameModel, {
    foreignKey: "roomId",
  });
  Room.hasMany(models.playerModel, {
    foreignKey: "roomId",
  });
};

module.exports = Room;
