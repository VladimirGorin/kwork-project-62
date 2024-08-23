import { Sequelize } from "sequelize";

const sequelize = new Sequelize({
    host: process.env.POSTGRES_HOST,
    dialect: 'postgres',
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    logging: false
});

(async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync();

        console.log("Successfully connected to the database")
    } catch (error) {
        console.error("Unable to connect to the database:", error);
    }
})();

export default sequelize
