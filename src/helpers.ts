export function _clone(obj: any) {
    if (obj === null || typeof(obj) !== 'object') {
        return obj;
    }

    return JSON.parse(JSON.stringify(obj));
}

export function _isDefined(...args: any[]) {
    return args.every((arg) => arg !== undefined);
}
