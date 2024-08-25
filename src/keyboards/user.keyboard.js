
export function generateWebAppUserKeyboard(url) {
    return {
        inline_keyboard: [[{ text: "Открыть webApp", web_app: { url } }]],
    };
}

export function generateUserKeyboard(webAppURL, channelURL) {
    return {
        inline_keyboard: [
            [{ text: "Открыть канал", url: channelURL}],
            [{ text: "Открыть webApp", web_app: { url:webAppURL } }]
        ],
    };
}
