import { DataTypes } from "sequelize";
import sequelize from "../index.js";

const MailingTask = sequelize.define("mailingTask", {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    unique: true,
    autoIncrement: true,
  },
  messageFormat: { type: DataTypes.STRING },
  gif: { type: DataTypes.STRING },
  photo: { type: DataTypes.STRING },
  caption: { type: DataTypes.STRING },
  webAppURL: { type: DataTypes.STRING },
  channelURL: { type: DataTypes.STRING },
  scheduledTime: { type: DataTypes.STRING },
});

export default MailingTask;
