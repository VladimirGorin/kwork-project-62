import { DataTypes } from "sequelize";
import sequelize from "../index.js";

const Message = sequelize.define("message", {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    unique: true,
    autoIncrement: true,
  },
  messageFormat: { type: DataTypes.TEXT },
  messageType: { type: DataTypes.TEXT },
  gif: { type: DataTypes.TEXT },
  photo: {type: DataTypes.TEXT },
  text: { type: DataTypes.TEXT },
  keyboards: { type: DataTypes.JSONB}
});

export default Message;
