import MailingTask from "../database/models/MailingTask.model.js";
import Message from "../database/models/Message.model.js";
import User from "../database/models/User.model.js";
import {
    addMailingScheduleAdminKeyboard,
    changeMessagesAdminKeyboard,
} from "../keyboards/admin.keyboard.js";
import {
    exportChannelURL,
    exportScheduledTime,
    exportWebAppURL,
    mailingAll,
} from "../utils.js";

export async function callbackQuery(bot, msg) {
    const chatId = msg.from.id;
    const data = msg.data;

    function inputMessageValidation(msg) {
        const animation = msg?.animation;

        const photo = msg?.photo;

        if (!animation && !photo) {
            throw Error("Вы не передали GIF или PHOTO!");
        }

        const caption = msg?.caption;

        if (!caption) {
            throw Error("Вы не передали Текст!");
        }

        const webAppURL = exportWebAppURL(caption);

        if (!webAppURL.url) {
            throw Error("Вы не передали webApp ссылку!");
        }

        const channelURL = exportChannelURL(webAppURL.text);

        if (!channelURL.url) {
            throw Error("Вы не передали ссылку на канал!");
        }

        const result = {
            format: null,
            photo: null,
            gif: null,
            caption: channelURL.text,
            webAppURL: webAppURL.url,
            channelURL: channelURL.url
        };

        if (photo) {
            const photoId = photo[photo.length - 1].file_id
            result.photo = photoId;
            result.format = "photo"
        } else if (animation) {
            const animationId = msg?.animation?.file_id;
            result.gif = animationId;
            result.format = "gif"
        } else {
            throw Error("Не известный формат файла!");
        }

        return result
    }

    switch (data) {
        case "mailing_all":
            async function mailingAllInput(msg) {
                try {
                    if (msg.from.id != chatId) {
                        return;
                    }

                    const validData = inputMessageValidation(msg)

                    bot.removeListener("message", mailingAllInput);

                    let mailingAllMessages = await Message.findOne({
                        where: { messageType: "mailingAll" },
                    });

                    if (!mailingAllMessages) {
                        await Message.create({
                            messageType: "mailingAll",
                            messageFormat: validData.format,
                            webAppURL: validData.webAppURL,
                            channelURL: validData.channelURL,
                            gif: validData.gif,
                            photo: validData.photo,
                            caption: validData.caption,
                        });


                    } else {
                        mailingAllMessages.update({
                            messageFormat: validData.format,
                            webAppURL: validData.webAppURL,
                            channelURL: validData.channelURL,
                            gif: validData.gif,
                            photo: validData.photo,
                            caption: validData.caption,
                        });
                    }

                    const users = await User.findAll();
                    await bot.sendMessage(
                        chatId,
                        "Успех! Сообщение отправляется всем участникам бота."
                    );
                    await mailingAll(users, chatId, bot);
                } catch (error) {
                    bot.sendMessage(chatId, error.message);
                    bot.removeListener("message", mailingAllInput);
                }
            }

            await bot.sendMessage(
                chatId,
                "Отправьте в след. сообщении данные в формате:\n\n-GIF|Photo\n-Текст\n\n[webApp:ссылку на webApp]\n[channel:ссылку на канал]"
            );
            // bot.sendAnimation(
            //     chatId,
            //     "https://c.tenor.com/rn7pXo8URPcAAAAd/tenor.gif",
            //     {
            //         caption: "Ваш текст\n\nваша ссылка здесь",
            //         reply_markup: exampleWebAppAdminKeyboard,
            //     }
            // );

            bot.on("message", mailingAllInput);

            break;

        case "change_messages":
            bot.sendMessage(chatId, "Выберете метод", {
                reply_markup: changeMessagesAdminKeyboard,
            });
            break;
        case "change_start_message":
            async function changeStartMessageInput(msg) {
                try {
                    if (msg.from.id != chatId) {
                        return;
                    }
                    const validData = inputMessageValidation(msg)

                    bot.removeListener("message", changeStartMessageInput);

                    let startMessage = await Message.findOne({
                        where: { messageType: "start" },
                    });

                    if (!startMessage) {
                        await Message.create({
                            messageType: "start",
                            messageFormat: validData.format,
                            webAppURL: validData.webAppURL,
                            channelURL: validData.channelURL,
                            gif: validData.gif,
                            photo: validData.photo,
                            caption: validData.caption,
                        });
                    } else {
                        startMessage.update({
                            messageFormat: validData.format,
                            webAppURL: validData.webAppURL,
                            channelURL: validData.channelURL,
                            gif: validData.gif,
                            photo: validData.photo,
                            caption: validData.caption,
                        });
                    }

                    await bot.sendMessage(
                        chatId,
                        "Успех! Стартовое сообщение успешно изменено."
                    );
                } catch (error) {
                    bot.sendMessage(chatId, error.message);
                    bot.removeListener("message", changeStartMessageInput);
                }
            }

            await bot.sendMessage(
                chatId,
                "Отправьте в след. сообщении данные в формате:\n\n-GIF|Photo\n-Текст\n\n[webApp:ссылку на webApp]\n[channel:ссылку на канал]"
            );

            bot.on("message", changeStartMessageInput);

            break;

        case "mailing_schedule":
            let mailingTasks = await MailingTask.findAll();
            if (mailingTasks.length) {
                mailingTasks = mailingTasks.map((task) => `ID: ${task.id}`);
                mailingTasks = mailingTasks.join("\n");
            } else {
                mailingTasks = "0 задач";
            }

            bot.sendMessage(chatId, `Статус:\n${mailingTasks}`, {
                reply_markup: addMailingScheduleAdminKeyboard,
            });
            break;

        case "add_mailing_schedule":
            async function addMailingScheduleInput(msg) {
                try {
                    if (msg.from.id != chatId) {
                        return;
                    }

                    const validData = inputMessageValidation(msg)

                    const scheduledTime = exportScheduledTime(validData.caption);

                    if (!scheduledTime) {
                        throw Error("Вы не передали scheduledTime!");
                    }

                    bot.removeListener("message", addMailingScheduleInput);

                    const newTask = await MailingTask.create({
                        messageFormat: validData.format,
                        webAppURL: validData.webAppURL,
                        channelURL: validData.channelURL,
                        gif: validData.gif,
                        photo: validData.photo,
                        caption: scheduledTime.text,
                        scheduledTime: scheduledTime.time,
                    });

                    await bot.sendMessage(
                        chatId,
                        `Успех! Новая задача добавлена под ID: ${newTask?.id}`
                    );
                } catch (error) {
                    bot.sendMessage(chatId, error.message);
                    bot.removeListener("message", addMailingScheduleInput);
                }
            }

            await bot.sendMessage(
                chatId,
                "Отправьте в след. сообщении данные в формате:\n\n-GIF|Photo\n-Текст\n\n[webApp:ссылку на webApp]\n[channel:ссылку на канал]\n[scheduledTime:2024-08-23 14:30:00]"
            );

            bot.on("message", addMailingScheduleInput);

            break;

        default:
            break;
    }
}
