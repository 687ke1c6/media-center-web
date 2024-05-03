export const toSize = (size: string) =>
    `${Math.floor(parseInt(size, 10) / 1024 / 1024 / 1024 * 100) / 100} Gb`;

export const toDate = (date: string) =>
    new Date(parseInt(date, 10) * 1000).toDateString();

export const toCategory = (category: string) =>
    category;

export const toFsSize = (rate: string) => {
    const dr = parseInt(rate, 10);
    if (dr >= 1024 * 1024) {
        return `${(dr / (1024 * 1024)).toFixed(2)}mb`;
    }
    if (dr >= 1024) {
        return `${(dr / (1024)).toFixed(2)}kb`;
    }
    return `${dr.toFixed(2)}b`
}

export const toTime = (seconds: string) => {
    const ts = parseInt(seconds, 10);
    if (ts > 60 * 60) {
        return `${(ts / 60 / 60).toFixed()}hr(s)`;
    }
    if (ts > 60) {
        return `${(ts / 60).toFixed(2)}min(s)`;
    }
    return `${ts}sec(s)`
}