
export function generateWebAppUserKeyboard(url) {
    return {
        inline_keyboard: [[{ text: "Открыть webApp", web_app: { url } }]],
    };
}
