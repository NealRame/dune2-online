export type EasingFunction<T> = (t: number) => T

export function linear(t: number): number {
    return t
}

export * as Quadratic from "./quadratic"
export * as Cubic from "./cubic"
export * as Exp from "./exp"
