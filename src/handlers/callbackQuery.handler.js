import MailingTask from "../database/models/MailingTask.model.js";
import Message from "../database/models/Message.model.js";
import User from "../database/models/User.model.js";
import { addMailingScheduleAdminKeyboard, changeMessagesAdminKeyboard } from "../keyboards/admin.keyboard.js";
import { exportScheduledTime, exportWebAppURL, mailingAll } from "../utils.js";

export async function callbackQuery(bot, msg) {
    const chatId = msg.from.id;
    const data = msg.data;

    switch (data) {
        case "mailing_all":
            async function mailingAllInput(msg) {
                try {
                    if (msg.from.id != chatId) {
                        return
                    }

                    const animation = msg?.animation;
                    const animationId = msg?.animation?.file_id;

                    const caption = msg?.caption;

                    if (!animation) {
                        throw Error("Вы не передали GIF!");
                    }

                    if (!caption) {
                        throw Error("Вы не передали Текст!");
                    }


                    const webAppURL = exportWebAppURL(caption);

                    if (!webAppURL.url) {
                        throw Error("Вы не передали webApp ссылку!");
                    }

                    bot.removeListener("message", mailingAllInput);

                    let mailingAllMessages = await Message.findOne({
                        where: { messageType: "mailingAll" },
                    });

                    if (!mailingAllMessages) {
                        mailingAllMessages = await Message.create({
                            messageType: "mailingAll",
                            webAppURL: webAppURL.url,
                            gif: animationId,
                            caption: webAppURL.text,
                        });
                    } else {
                        mailingAllMessages.update({
                            webAppURL: webAppURL.url,
                            gif: animationId,
                            caption: webAppURL.text,
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
                "Отправьте в след. сообщении данные в формате:\n\n-GIF\n-Текст\n-Ссылку на канал (указывается так же в месте с текстом)\n[webApp:ссылку на webApp]"
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
                        return
                    }
                    const animation = msg?.animation;
                    const animationId = msg?.animation?.file_id;

                    const caption = msg?.caption;

                    if (!animation) {
                        throw Error("Вы не передали GIF!");
                    }

                    if (!caption) {
                        throw Error("Вы не передали Текст!");
                    }

                    const webAppURL = exportWebAppURL(caption);

                    if (!webAppURL.url) {
                        throw Error("Вы не передали webApp ссылку!");
                    }

                    bot.removeListener("message", changeStartMessageInput);

                    let startMessage = await Message.findOne({
                        where: { messageType: "start" },
                    });

                    if (!startMessage) {
                        startMessage = await Message.create({
                            messageType: "start",
                            webAppURL: webAppURL.url,
                            gif: animationId,
                            caption: webAppURL.text,
                        });
                    } else {
                        startMessage.update({
                            webAppURL: webAppURL.url,
                            gif: animationId,
                            caption: webAppURL.text,
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
                "Отправьте в след. сообщении данные в формате:\n\n-GIF\n-Текст\n-Ссылку на канал (указывается так же в месте с текстом)\n[webApp:ссылку на webApp]"
            );

            bot.on("message", changeStartMessageInput);

            break;

        case "mailing_schedule":

            let mailingTasks = await MailingTask.findAll()
            if (mailingTasks.length) {
                mailingTasks = mailingTasks.map(task => `ID: ${task.id}`)
                mailingTasks = mailingTasks.join("\n")
            } else {
                mailingTasks = "0 задач"
            }

            bot.sendMessage(chatId, `Статус:\n${mailingTasks}`, {
                reply_markup: addMailingScheduleAdminKeyboard,
            });
            break;

        case "add_mailing_schedule":
            async function addMailingScheduleInput(msg) {
                try {
                    if (msg.from.id != chatId) {
                        return
                    }
                    const animation = msg?.animation;
                    const animationId = msg?.animation?.file_id;

                    const caption = msg?.caption;

                    if (!animation) {
                        throw Error("Вы не передали GIF!");
                    }

                    if (!caption) {
                        throw Error("Вы не передали Текст!");
                    }

                    const webAppURL = exportWebAppURL(caption);

                    if (!webAppURL.url) {
                        throw Error("Вы не передали webApp ссылку!");
                    }

                    const scheduledTime = exportScheduledTime(webAppURL.text);

                    if (!scheduledTime) {
                        throw Error("Вы не передали scheduledTime!");
                    }
                    bot.removeListener("message", addMailingScheduleInput);

                    const newTask = await MailingTask.create({
                        webAppURL: webAppURL.url,
                        gif: animationId,
                        caption: scheduledTime.text,
                        scheduledTime: scheduledTime.time
                    })

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
                "Отправьте в след. сообщении данные в формате:\n\n-GIF\n-Текст\n-Ссылку на канал (указывается так же в месте с текстом)\n[webApp:ссылку на webApp]\n[scheduledTime:2024-08-23 14:30:00]"
            );

            bot.on("message", addMailingScheduleInput);

            break;

        default:
            break;
    }
}
