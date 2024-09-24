import { DataTypes } from "sequelize";
import sequelize from "../index.js";

const PushNotification = sequelize.define("pushNotification", {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    unique: true,
    autoIncrement: true,
  },
  messageFormat: { type: DataTypes.STRING },
  gif: { type: DataTypes.STRING },
  photo: { type: DataTypes.STRING },
  text: { type: DataTypes.STRING },
  webAppURL: { type: DataTypes.STRING },
  channelURL: { type: DataTypes.STRING },
  minutes: { type: DataTypes.STRING },
  keyboards: { type: DataTypes.JSONB}
});

export default PushNotification;
