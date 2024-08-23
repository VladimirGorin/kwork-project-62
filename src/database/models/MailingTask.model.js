import { DataTypes } from "sequelize";
import sequelize from "../index.js";

const MailingTask = sequelize.define("mailingTask", {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    unique: true,
    autoIncrement: true,
  },
  gif: { type: DataTypes.STRING },
  caption: { type: DataTypes.STRING },
  webAppURL: { type: DataTypes.STRING },
  scheduledTime: { type: DataTypes.STRING }
});

export default MailingTask;
