import moment from "moment-timezone";
import MailingTask from "./database/models/MailingTask.model.js";
import Message from "./database/models/Message.model.js";
import { generateUserKeyboard } from "./keyboards/user.keyboard.js";
import User from "./database/models/User.model.js";
import PushNotification from "./database/models/PushNotification.model.js";

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
                    type: "text",
                };
            } else {
                const keyboard = generateUserKeyboard(startMessage?.keyboards);

                response = {
                    text: startMessage.text,
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


export function exportKeyboard(inputTextString) {
    const pattern = /\[keyboard\((.*?)\)\((.*?)\): (.*?)\]/g;
    const matches = [...inputTextString.matchAll(pattern)];

    if (!matches.length) {
        return {
            text: inputTextString,
            buttons: null
        };
    }

    const cleanedText = inputTextString.replace(pattern, '').trim();

    const buttons = matches.map(match => ({
        buttonValue: match[3].trim(),
        buttonName: match[1].trim(),
        buttonType: match[2].trim()
    }));

    return {
        text: cleanedText,
        buttons
    };
}

export function exportEntities(text, entities) {
    let result = text;

    for (let i = entities.length - 1; i >= 0; i--) {
        const { offset, length, url } = entities[i];
        const part = text.slice(offset, offset + length);
        const link = `<a href="${url}">${part}</a>`;

        result = result.slice(0, offset) + link + result.slice(offset + length);
    }

    return result;
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

export function exportMinutes(text) {
    const pattern = /\[minutes:(.*?)\]/;
    const match = text.match(pattern);
    const minutesValue = match ? match[1] : null;
    const otherText = text.replace(pattern, "").trim();

    if (!minutesValue) {
        return minutesValue;
    }

    if (!minutesValue) {
        return null
    }

    return { time: minutesValue, text: otherText };
}

export async function mailingAll(users, adminChatId, bot) {
    try {
        const mailingAllMessage = await Message.findOne({
            where: { messageType: "mailingAll" },
        });

        const keyboard = generateUserKeyboard(mailingAllMessage?.keyboards);

        users.forEach((user) => {
            try {

                if (mailingAllMessage.messageFormat == "photo") {
                    bot.sendPhoto(user.chatId, mailingAllMessage?.photo, {
                        caption: mailingAllMessage.text,
                        reply_markup: keyboard,
                        parse_mode: "html"
                    });
                } else if (mailingAllMessage.messageFormat == "gif") {
                    bot.sendAnimation(user.chatId, mailingAllMessage?.gif, {
                        caption: mailingAllMessage.text,
                        reply_markup: keyboard,
                        parse_mode: "html"
                    });
                } else if (mailingAllMessage.messageFormat == "text") {
                    bot.sendMessage(user.chatId, mailingAllMessage?.text, { reply_markup: keyboard, parse_mode: "html" })
                } else {
                    throw Error("Не известный формат сообщения!")
                }

            } catch (error) {
                bot.sendMessage(
                    adminChatId,
                    `Не удалось отправить сообщения для пользователя (${user.name}) ошибка: ${error.message} `
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

export async function sendPushNotifications(user, bot) {
    const pushNotifications = await PushNotification.findAll();
    const adminUsers = await User.findAll({ where: { isAdmin: true } });

    async function executeNotification(notification) {

        try {
            const keyboard = generateUserKeyboard(notification?.keyboards);

            if (notification.messageFormat == "photo") {
                bot.sendPhoto(user.chatId, notification?.photo, {
                    caption: notification.text,
                    reply_markup: keyboard,
                    parse_mode: "html"
                });
            } else if (notification.messageFormat == "gif") {
                bot.sendAnimation(user.chatId, notification?.gif, {
                    caption: notification.text,
                    reply_markup: keyboard,
                    parse_mode: "html"
                });
            } else if (notification.messageFormat == "text") {
                bot.sendMessage(user.chatId, notification?.text, {
                    reply_markup: keyboard,
                    parse_mode: "html"
                })
            }
            else {
                throw Error("Не известный формат сообщения!")
            }


        } catch (error) {
            adminUsers.forEach((admin) => {
                bot.sendMessage(
                    admin.chatId,
                    `При попытке пуш-уведомления ID:(${notification?.id}) для пользователя (${user?.chatId}) произошла ошибка: ${error.message}`
                );
            });
        }
    }

    pushNotifications.forEach((notification) => {
        try {
            let notificationTime = notification?.minutes;

            if(!notificationTime){
                throw Error(`Не корректное время таймера: ${notificationTime}`)
            }

            notificationTime = Number(notificationTime)
            const minutesToMilliseconds = (minutes) => minutes * 60 * 1000;

            setTimeout(() => {
                executeNotification(notification);
            }, minutesToMilliseconds(notificationTime));

        } catch (error) {
            adminUsers.forEach((admin) => {
                bot.sendMessage(
                    admin.chatId,
                    `При попытке пуш-уведомления ID:(${notification?.id}) для пользователя (${user?.chatId}) произошла ошибка: ${error.message}`
                );
            });
        }
    });
}


export async function checkTasksForMailing(bot) {
    const tasks = await MailingTask.findAll();
    let now = moment().tz("Europe/Moscow");
    now = new Date(now);

    async function executeTask(task) {
        const adminUsers = await User.findAll({ where: { isAdmin: true } });

        try {
            const users = await User.findAll();

            const keyboard = generateUserKeyboard(task?.keyboards);

            users.forEach((user) => {
                try {
                    if (task.messageFormat == "photo") {
                        bot.sendPhoto(user.chatId, task?.photo, {
                            caption: task.text,
                            reply_markup: keyboard,
                            parse_mode: "html"
                        });
                    } else if (task.messageFormat == "gif") {
                        bot.sendAnimation(user.chatId, task?.gif, {
                            caption: task.text,
                            reply_markup: keyboard,
                            parse_mode: "html"
                        });
                    } else if (task.messageFormat == "text") {
                        bot.sendMessage(user.chatId, task?.text, {
                            reply_markup: keyboard,
                            parse_mode: "html"
                        })
                    }
                    else {
                        throw Error("Не известный формат сообщения!")
                    }

                } catch (error) {
                    adminUsers.forEach((admin) => {
                        bot.sendMessage(
                            admin.chatId,
                            `При попытке рассылки по дате (${task?.scheduledTime}) (${task?.id}) для пользователя (${user?.chatId}) произошла ошибка (продолжаем): ${error.message}`
                        );
                    });
                }
            });
        } catch (error) {
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

export function exportUniqueTextFields(text) {
    const regex = /\[(.*)\]\(link\)\((https?:\/\/[^\s]+)\)/g;

    return text.replace(regex, '<a href="$2">$1</a>');
}
