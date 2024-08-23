import { DataTypes } from "sequelize";
import sequelize from "../index.js";

const Message = sequelize.define("message", {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    unique: true,
    autoIncrement: true,
  },
  messageType: { type: DataTypes.STRING },
  gif: { type: DataTypes.STRING },
  caption: { type: DataTypes.STRING },
  webAppURL: { type: DataTypes.STRING },
});

export default Message;
