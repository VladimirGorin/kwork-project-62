export const startAdminKeyboard = {
    inline_keyboard: [
        [{ text: "Сделать рассылку", callback_data: "mailing_all" }],
        [
            {
                text: "Рассылка по дате",
                callback_data: "mailing_schedule",
            }
        ],
        [{ text: "Изменить сообщения", callback_data: "change_messages" }],
        [{ text: "Пуш уведомления", callback_data: "push_notification" }]
    ],
};

export const mailingScheduleAdminKeyboard = {
    inline_keyboard: [
        [
            {
                text: "Добавить рассылку по дате",
                callback_data: "add_mailing_schedule",
            }, {
                text: "Удалить рассылку",
                callback_data: "delete_mailing_schedule",
            },
        ],
    ],
};

export const pushNotificationAdminKeyboard = {
    inline_keyboard: [
        [
            {
                text: "Добавить пуш уведомления",
                callback_data: "add_push_notification",
            }
        ], [
            {
                text: "Удалить пуш уведомления",
                callback_data: "delete_push_notification",
            }
        ]
    ],
};

export const changeMessagesAdminKeyboard = {
    inline_keyboard: [
        [
            {
                text: "Изменить сообщение /start",
                callback_data: "change_start_message",
            },
        ],
    ],
};

export const exampleWebAppAdminKeyboard = {
    inline_keyboard: [
        [{ text: "Открыть webApp", web_app: { url: "https://youtube.com" } }],
    ],
};
