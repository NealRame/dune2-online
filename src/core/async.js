export function setImmediate(fn, ...args) {
    return Promise.resolve().then(() => fn(...args))
}