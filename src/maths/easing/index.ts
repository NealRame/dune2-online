export type EasingFunction = (t: number) => number

export function linear(t: number): number {
    return t
}

export function step(count: number): (t: number) => number {
    return t => Math.floor(count*t)/count
}

export * as Quadratic from "./quadratic"
export * as Cubic from "./cubic"
export * as Exp from "./exp"
