export function getCookieValue(win, cookieName, defaultValue) {
    let cookies;
    try {
        cookies = win.document.cookie.split(";");
    } catch (err) {
        return defaultValue;
    }
    for (const cookie of cookies) {
        try {
            const [key, value = ""] = cookie.split("=").map(item => item.trim());
            if (key === cookieName) {
                return value;
            }
        } catch (err) {}
    }
    return defaultValue;
}
