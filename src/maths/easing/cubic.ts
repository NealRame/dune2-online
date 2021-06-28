export function easeIn(t: number): number {
    return t*t*t
}

export function easeOut(t: number): number {
    return easeIn(t - 1) + 1
}

export function easeInOut(t: number): number {
    return (t < 0.5 ? easeIn(2*t) : easeOut(2*t-1) + 1)/2
}
