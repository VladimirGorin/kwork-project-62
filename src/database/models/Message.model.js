import { DataTypes } from "sequelize";
import sequelize from "../index.js";

const Message = sequelize.define("message", {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    unique: true,
    autoIncrement: true,
  },
  messageFormat: { type: DataTypes.STRING },
  messageType: { type: DataTypes.STRING },
  gif: { type: DataTypes.STRING },
  photo: {type: DataTypes.STRING },
  text: { type: DataTypes.STRING },
  keyboards: { type: DataTypes.JSONB}
});

export default Message;
