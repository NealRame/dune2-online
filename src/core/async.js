export function setImmediate(fn, ...args) {
    return new Promise(resolve => {
        setTimeout(() => resolve(fn(...args)), 0)
    })
}