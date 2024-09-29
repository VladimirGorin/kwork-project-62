import { DataTypes } from "sequelize";
import sequelize from "../index.js";

const PushNotification = sequelize.define("pushNotification", {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    unique: true,
    autoIncrement: true,
  },
  messageFormat: { type: DataTypes.TEXT },
  gif: { type: DataTypes.TEXT },
  photo: { type: DataTypes.TEXT },
  text: { type: DataTypes.TEXT },
  webAppURL: { type: DataTypes.TEXT },
  channelURL: { type: DataTypes.TEXT },
  minutes: { type: DataTypes.TEXT },
  keyboards: { type: DataTypes.JSONB}
});

export default PushNotification;
