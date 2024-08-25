import moment from "moment-timezone";
import MailingTask from "./database/models/MailingTask.model.js";
import Message from "./database/models/Message.model.js";
import { generateUserKeyboard } from "./keyboards/user.keyboard.js";
import User from "./database/models/User.model.js";

export async function generateMessage(type, msg, user) {
    let response = {};

    switch (type) {
        case "start":
            const startMessage = await Message.findOne({
                where: { messageType: "start" },
            });

            if (!startMessage) {
                response = {
                    text: `Привет ${user.name}. Админ ещё не установил стартовое сообщение, пожалуйста свяжитесь с администратором.`,
                    type: "message",
                };
            } else {
                const keyboard = generateUserKeyboard(
                    startMessage.webAppURL,
                    startMessage.channelURL

                );

                response = {
                    text: startMessage.caption,
                    keyboard,
                    photo: startMessage.photo,
                    gif: startMessage.gif,
                    type: startMessage.messageFormat,
                }
            }

            break;

        default:
            response = { text: `Не известный тип для генерации сообщения!` };
            break;
    }

    return response;
}

export function exportWebAppURL(text) {
    const pattern = /\[webApp:(.*?)\]/;
    const match = text.match(pattern);
    const webAppValue = match ? match[1] : null;
    const textWithoutWebapp = text.replace(pattern, "").trim();

    return { text: textWithoutWebapp, url: webAppValue.replace(" ") };
}

export function exportChannelURL(text) {
    const pattern = /\[channel:(.*?)\]/;
    const match = text.match(pattern);
    const channelValue = match ? match[1] : null;
    const textWithoutChannel = text.replace(pattern, "").trim();

    return { text: textWithoutChannel, url: channelValue.replace(" ") };
}

export function exportScheduledTime(text) {
    const pattern = /\[scheduledTime:(.*?)\]/;
    const match = text.match(pattern);
    const scheduledTimeValue = match ? match[1] : null;
    const otherText = text.replace(pattern, "").trim();

    if (!scheduledTimeValue) {
        return scheduledTimeValue;
    }

    const date = moment.tz(scheduledTimeValue, "Europe/Moscow");

    if (!date.isValid()) {
        return null;
    }

    return { time: date.format(), text: otherText };
}

export async function mailingAll(users, adminChatId, bot) {
    try {
        const mailingAllMessage = await Message.findOne({
            where: { messageType: "mailingAll" },
        });

        const keyboard = generateUserKeyboard(
            mailingAllMessage.webAppURL,
            mailingAllMessage.channelURL

        );

        users.forEach((user) => {
            try {
                if (mailingAllMessage.messageFormat == "photo") {
                    bot.sendPhoto(user.chatId, mailingAllMessage?.photo, {
                        caption: mailingAllMessage.caption,
                        reply_markup: keyboard,
                    });
                } else if (mailingAllMessage.messageFormat == "gif") {
                    bot.sendAnimation(user.chatId, mailingAllMessage?.gif, {
                        caption: mailingAllMessage.caption,
                        reply_markup: keyboard,
                    });
                } else {
                    throw Error("Не известный формат сообщения!")
                }

            } catch (error) {
                bot.sendMessage(
                    adminChatId,
                    `Не удалось отправить сообщения для пользователя: ${user.username} `
                );
            }
        });
    } catch (error) {
        bot.sendMessage(
            adminChatId,
            `При попытке рассылки произошла ошибка: ${error.message}`
        );
    }
}

export async function checkTasksForMailing(bot) {
    const tasks = await MailingTask.findAll();
    let now = moment().tz("Europe/Moscow");
    now = new Date(now);

    async function executeTask(task) {
        try {
            const users = await User.findAll();

            const keyboard = generateUserKeyboard(
                task.webAppURL,
                task.channelURL
            );

            users.forEach((user) => {
                if (task.messageFormat == "photo") {
                    bot.sendPhoto(user.chatId, task?.photo, {
                        caption: task.caption,
                        reply_markup: keyboard,
                    });
                } else if (task.messageFormat == "gif") {
                    bot.sendAnimation(user.chatId, task?.gif, {
                        caption: task.caption,
                        reply_markup: keyboard,
                    });
                } else {
                    throw Error("Не известный формат сообщения!")
                }
            });
        } catch (error) {
            const adminUsers = await User.findAll({ where: { isAdmin: true } });
            adminUsers.forEach((admin) => {
                bot.sendMessage(
                    admin.chatId,
                    `При попытке рассылки по дате (${task?.scheduledTime}) (${task?.id}) произошла ошибка: ${error.message}`
                );
            });
        }
    }

    tasks.forEach((task) => {
        const taskDate = new Date(task.scheduledTime);
        // console.log(now.getFullYear() === taskDate.getFullYear())
        // console.log(now.getMonth() === taskDate.getMonth())
        // console.log(now.getDate() === taskDate.getDate())
        // console.log(now.getHours() === taskDate.getHours())
        // console.log(now.getMinutes() === taskDate.getMinutes())

        if (
            now.getFullYear() === taskDate.getFullYear() &&
            now.getMonth() === taskDate.getMonth() &&
            now.getDate() === taskDate.getDate() &&
            now.getHours() === taskDate.getHours() &&
            now.getMinutes() === taskDate.getMinutes()
        ) {
            executeTask(task);
        }
    });
}
