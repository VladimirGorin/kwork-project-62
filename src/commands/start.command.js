import User from "../database/models/User.model.js";
import { startAdminKeyboard } from "../keyboards/admin.keyboard.js";
import { generateMessage } from "../utils.js";

export default async (bot, msg) => {
    const chatId = msg.from.id;
    const name =
        msg.from?.username || `${msg.from.first_name} ${msg.from?.last_name || ""}`;

    let user = await User.findOne({ where: { chatId } });

    if (!user) {
        user = await User.create({ chatId, name });
    }

    if (user?.isAdmin) {
        bot.sendMessage(chatId, "Привет Админ!", {
            reply_markup: startAdminKeyboard,
        });

        return
    } else {
        const message = await generateMessage("start", msg, user);

        if (message?.type) {
            if (message?.type == "animation") {
                if (!message?.gif) {
                    bot.sendMessage(chatId, message?.text);
                } else {
                    bot.sendAnimation(chatId, message?.gif, {
                        caption: message?.text,
                        reply_markup: message?.keyboard,
                    });
                }
            } else if (message?.type == "photo") {
                bot.sendPhoto(chatId, message?.photo, {caption: message?.text, reply_markup: message?.keyboard});
            } else if (message?.type == "message") {
                bot.sendMessage(chatId, message?.text);
            } else {
                bot.sendMessage(chatId, "Не известный тип generateMessage!");
            }
        } else {
            bot.sendMessage(chatId, message.text);
        }
    }
};
