import MailingTask from "../database/models/MailingTask.model.js";
import Message from "../database/models/Message.model.js";
import PushNotification from "../database/models/PushNotification.model.js";
import User from "../database/models/User.model.js";
import {
    changeMessagesAdminKeyboard,
    mailingScheduleAdminKeyboard,
    pushNotificationAdminKeyboard,
} from "../keyboards/admin.keyboard.js";
import {
    exportEntities,
    exportKeyboard,
    exportMinutes,
    exportScheduledTime,
    exportUniqueTextFields,
    mailingAll,
} from "../utils.js";

export async function callbackQuery(bot, msg) {
    const chatId = msg.from.id;
    const data = msg.data;

    function inputMessageValidation(msg) {
        const animation = msg?.animation;

        const photo = msg?.photo;

        let text = msg?.caption || msg?.text

        if (!text) {
            throw Error("Вы не передали Текст!");
        }

        const keyboards = exportKeyboard(text)

        if (!keyboards) {
            throw Error("Вы не передали Клавиатуру!");
        }

        if (!keyboards.text) {
            throw Error("Вы не передали Текст!");
        }

        const updatedText = exportUniqueTextFields(keyboards.text)

        const result = {
            format: null,
            photo: null,
            gif: null,
            text: updatedText,
            keyboards: keyboards.buttons
        };

        if (photo) {
            const photoId = photo[photo.length - 1].file_id
            result.photo = photoId;
            result.format = "photo"
        } else if (animation) {
            const animationId = msg?.animation?.file_id;
            result.gif = animationId;
            result.format = "gif"
        } else if (text) {
            result.format = "text"
        } else {
            throw Error("Не известный формат файла!");
        }

        return result
    }


    // bot.on("message", inputMessageValidation)
    // return

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
                            keyboards: validData.keyboards,
                            gif: validData.gif,
                            photo: validData.photo,
                            text: validData.text,
                        });


                    } else {
                        mailingAllMessages.update({
                            messageFormat: validData.format,
                            keyboards: validData.keyboards,
                            gif: validData.gif,
                            photo: validData.photo,
                            text: validData.text,
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
                "Отправьте в след. сообщении данные в формате:\n\n-GIF|Photo\n-Текст\nСсылку в тексте(link)(https://youtube.com)\n\n[keyboard(название кнопки)(тип (webApp, link)): значение кнопки]"
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
                            keyboards: validData.keyboards,
                            gif: validData.gif,
                            photo: validData.photo,
                            text: validData.text,
                        });
                    } else {
                        startMessage.update({
                            messageFormat: validData.format,
                            keyboards: validData.keyboards,
                            gif: validData.gif,
                            photo: validData.photo,
                            text: validData.text,
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
                "Отправьте в след. сообщении данные в формате:\n\n-GIF|Photo\n-Текст\nСсылку в тексте(link)(https://youtube.com)\n\n[keyboard(название кнопки)(тип (webApp, link)): значение кнопки]"
            );

            bot.on("message", changeStartMessageInput);

            break;

        case "mailing_schedule":
            let mailingTasks = await MailingTask.findAll();
            if (mailingTasks.length) {
                mailingTasks = mailingTasks.map((task) => `ID: ${task.id} Время: ${task.scheduledTime}`);
                mailingTasks = mailingTasks.join("\n");
            } else {
                mailingTasks = "0 задач";
            }

            bot.sendMessage(chatId, `Статус:\n${mailingTasks}`, {
                reply_markup: mailingScheduleAdminKeyboard,
            });
            break;

        case "add_mailing_schedule":
            async function addMailingScheduleInput(msg) {
                try {
                    if (msg.from.id != chatId) {
                        return;
                    }

                    const validData = inputMessageValidation(msg)

                    const scheduledTime = exportScheduledTime(validData.text);

                    if (!scheduledTime) {
                        throw Error("Вы не передали scheduledTime!");
                    }

                    bot.removeListener("message", addMailingScheduleInput);

                    const newTask = await MailingTask.create({
                        messageFormat: validData.format,
                        keyboards: validData.keyboards,
                        gif: validData.gif,
                        photo: validData.photo,
                        text: scheduledTime.text,
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
                "Отправьте в след. сообщении данные в формате:\n\n-GIF|Photo\n-Текст\nСсылку в тексте(link)(https://youtube.com)\n\n[keyboard(название кнопки)(тип (webApp, link)): значение кнопки]\n[scheduledTime:2024-08-23 14:30:00]"
            );

            bot.on("message", addMailingScheduleInput);

            break;

        case "delete_mailing_schedule":
            async function deleteMailingScheduleInput(msg) {
                try {
                    if (msg.from.id != chatId) {
                        return;
                    }

                    const text = msg?.text

                    if (!text) {
                        throw Error("Текст не передан")
                    }

                    const id = Number(text)

                    if (!id) {
                        throw Error("Вы уверены что передали число?")
                    }

                    try {
                        const findMailingTask = await MailingTask.findOne({ where: { id } })

                        if (!findMailingTask) {
                            throw Error("Не удалось найти такой задачи.")
                        }

                        await findMailingTask.destroy()
                        await findMailingTask.save()

                        bot.sendMessage(chatId, "Успешно удалено!")

                    } catch (error) {
                        throw Error(`Ошибка при попытке поиска в базе данных: ${error}`)
                    }

                    bot.removeListener("message", deleteMailingScheduleInput);

                } catch (error) {
                    bot.sendMessage(chatId, error.message);
                    bot.removeListener("message", deleteMailingScheduleInput);
                }
            }

            await bot.sendMessage(
                chatId,
                "Отправьте в след.\nID задачи которую вы хотите удалить"
            );

            bot.on("message", deleteMailingScheduleInput);
            break

        case "push_notification":
            let pushNotifications = await PushNotification.findAll();
            if (pushNotifications.length) {
                pushNotifications = pushNotifications.map((notification) => `ID: ${notification.id} Через (минут): ${notification.minutes}`);
                pushNotifications = pushNotifications.join("\n");
            } else {
                pushNotifications = "0 пушов";
            }

            bot.sendMessage(chatId, `Статус:\n${pushNotifications}`, {
                reply_markup: pushNotificationAdminKeyboard,
            });
            break;

        case "add_push_notification":
            async function addPushNotificationInput(msg) {
                try {
                    if (msg.from.id != chatId) {
                        return;
                    }

                    const validData = inputMessageValidation(msg)

                    const minutes = exportMinutes(validData.text);

                    if (!minutes) {
                        throw Error("Вы не передали minutes!");
                    }

                    bot.removeListener("message", addPushNotificationInput);

                    const newPush = await PushNotification.create({
                        messageFormat: validData.format,
                        keyboards: validData.keyboards,
                        gif: validData.gif,
                        photo: validData.photo,
                        text: minutes.text,
                        minutes: minutes.time,
                    });

                    await bot.sendMessage(
                        chatId,
                        `Успех! Новый пуш добавлен под ID: ${newPush?.id}`
                    );
                } catch (error) {
                    bot.sendMessage(chatId, error.message);
                    bot.removeListener("message", addPushNotificationInput);
                }
            }

            await bot.sendMessage(
                chatId,
                "Отправьте в след. сообщении данные в формате:\n\n-GIF|Photo\n-Текст\nСсылку в тексте(link)(https://youtube.com)\n\n[keyboard(название кнопки)(тип (webApp, link)): значение кнопки]\n[minutes:1]"
            );

            bot.on("message", addPushNotificationInput);

            break;

        case "delete_push_notification":
            async function deletePushNotificationInput(msg) {
                try {
                    if (msg.from.id != chatId) {
                        return;
                    }

                    const text = msg?.text

                    if (!text) {
                        throw Error("Текст не передан")
                    }

                    const id = Number(text)

                    if (!id) {
                        throw Error("Вы уверены что передали число?")
                    }

                    try {
                        const findPushNotification = await PushNotification.findOne({ where: { id } })

                        if (!findPushNotification) {
                            throw Error("Не удалось найти такого пуша.")
                        }

                        await findPushNotification.destroy()
                        await findPushNotification.save()

                        bot.sendMessage(chatId, "Успешно удалено!")

                    } catch (error) {
                        throw Error(`Ошибка при попытке поиска в базе данных: ${error}`)
                    }

                    bot.removeListener("message", deleteMailingScheduleInput);

                } catch (error) {
                    bot.sendMessage(chatId, error.message);
                    bot.removeListener("message", deleteMailingScheduleInput);
                }
            }

            await bot.sendMessage(
                chatId,
                "Отправьте в след.\nID пуша которого вы хотите удалить"
            );

            bot.on("message", deletePushNotificationInput);
            break

        default:
            break;
    }
}
