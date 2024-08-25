import TelegramBot from "node-telegram-bot-api";
import commands from "./src/commands/index.js";
import { callbackQuery } from "./src/handlers/callbackQuery.handler.js";
import { checkTasksForMailing } from "./src/utils.js";
import MailingTask from "./src/database/models/MailingTask.model.js";

const token = process.env.TELEGRAM_TOKEN;

if (!token) {
    throw Error("Token not provide");
}

const bot = new TelegramBot(token, { polling: true });

// Commands
bot.onText(/\/start/, (msg) => commands.startCommand(bot, msg));

// Handlers

bot.on("callback_query", (msg) => {
    callbackQuery(bot, msg);
});
bot.on("polling_error", console.log);

// Schedules
function startMailingCheckAtNewMinute() {
    const now = new Date();
    const msUntilNextMinute = (60 - now.getSeconds()) * 1000;
    console.log(msUntilNextMinute)

    setTimeout(() => {
        checkTasksForMailing(bot); // Run once immediately when the minute changes

        setInterval(() => {
            checkTasksForMailing(bot);
        }, 60 * 1000); // Then run every 60 seconds

    }, msUntilNextMinute);
}

startMailingCheckAtNewMinute();
