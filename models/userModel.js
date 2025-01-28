const { DataTypes } = require("sequelize");
const dbConnection = require("../database/db.config");

const User = dbConnection.define("users", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  wins: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  losses: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  draws: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
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

User.associate = (models) => {
  User.hasMany(models.RoomModel, {
    foreignKey: "createdBy",
  });
  User.hasMany(models.gameModel, {
    foreignKey: "currentPlayer",
  });
  User.hasMany(models.gameModel, {
    foreignKey: "winner",
  });
  User.hasMany(models.playerModel, {
    foreignKey: "playerId",
  });
};

module.exports = User;
