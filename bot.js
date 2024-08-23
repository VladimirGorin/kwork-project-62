import TelegramBot from "node-telegram-bot-api";
import commands from "./src/commands/index.js";
import { callbackQuery } from "./src/handlers/callbackQuery.handler.js";
import { checkTasksForMailing, exportScheduledTime } from "./src/utils.js";

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
setInterval(() => (checkTasksForMailing(bot)), 60 * 1000);
checkTasksForMailing(bot)
