export function trimTrailingName(name, maxLength) {
    if (maxLength <= 0 || name.length <= maxLength) {
        return name;
    }
    return name.substring(0, maxLength) + "...";
}