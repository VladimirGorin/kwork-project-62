
export function generateWebAppUserKeyboard(url) {
    return {
        inline_keyboard: [[{ text: "Открыть webApp", web_app: { url } }]],
    };
}

export function generateUserKeyboard(keyboards) {
    const items = keyboards
        .map(keyboard => {
            if (keyboard && keyboard.buttonValue && keyboard.buttonName && keyboard.buttonType) {
                if (keyboard.buttonType === "webApp") {
                    return [{ text: keyboard.buttonName, web_app: { url: keyboard.buttonValue } }];
                } else if (keyboard.buttonType === "link") {
                    return [{ text: keyboard.buttonName, url: keyboard.buttonValue }];
                }
            }
            return undefined;
        })
        .filter(item => item !== undefined);

    return {
        inline_keyboard: items,
    };
}
