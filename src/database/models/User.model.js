import { DataTypes } from "sequelize";
import sequelize from "../index.js";

const User = sequelize.define("user", {
    id: {type: DataTypes.BIGINT, primaryKey: true, unique: true, autoIncrement: true},
    chatId: {type: DataTypes.BIGINT, unique: true},
    name: {type: DataTypes.TEXT},
    isAdmin: {type: DataTypes.BOOLEAN, defaultValue: false}
})


export default User
