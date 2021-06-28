export function easeIn(a: number): (t: number) => number {
    const b = 2**a - 1
    return t => (2**(a*t) - 1)/b
}

export function easeOut(a: number): (t: number) => number {
    const b = 2**a
    const c = b - 1
    return t => b*(1 - 2**(-a*t))/c
}
