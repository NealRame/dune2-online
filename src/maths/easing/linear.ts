export function easeIn(t: number): number {
    return t
}

export function easeOut(t: number): number {
    return 1 - t
}

export function easeInOut(t: number): number {
    return 2*(t < 0.5 ? easeIn(t) : easeOut(t))
}
