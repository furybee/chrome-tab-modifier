export function _clone(obj: any) {
    if (obj === null || typeof (obj) !== 'object') {
        return obj;
    }

    return JSON.parse(JSON.stringify(obj));
}

export function _chromeColor(color: string) {
    switch (color) {
        case 'grey':
            return '#dadce0';
        case 'blue':
            return '#8ab4f7';
        case 'red':
            return '#f28b82';
        case 'yellow':
            return '#fdd663';
        case 'green':
            return '#81c995';
        case 'pink':
            return '#ff8bcb';
        case 'purple':
            return '#c589f9';
        case 'cyan':
            return '#78d9ec';
        case 'orange':
            return '#fcad70';
    }
}

export function _isDefined(...args: any[]) {
    return args.every((arg) => arg !== undefined);
}
