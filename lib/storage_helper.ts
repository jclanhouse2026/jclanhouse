
export const getLocalData = <T>(key: string, defaultValue: T): T => {
    try {
        const data = localStorage.getItem(`jclanhouse_${key}`);
        return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
        console.error(`Error reading local storage key ${key}:`, error);
        return defaultValue;
    }
};

export const setLocalData = <T>(key: string, data: T): void => {
    try {
        localStorage.setItem(`jclanhouse_${key}`, JSON.stringify(data));
    } catch (error) {
        console.error(`Error writing local storage key ${key}:`, error);
    }
};

export const removeLocalData = (key: string): void => {
    localStorage.removeItem(`jclanhouse_${key}`);
};
