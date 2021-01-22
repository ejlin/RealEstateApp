export function trimTrailingName(name, maxLength) {
    if (maxLength <= 0 || name.length <= maxLength) {
        return name;
    }
    return name.substring(0, maxLength) + "...";
}

export function capitalizeName(x) {
    return x.charAt(0).toUpperCase() + x.slice(1);
}