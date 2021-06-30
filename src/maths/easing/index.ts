import { linspace } from "../linspace"

export type EasingFunction = (t: number) => number

export function linear(t: number): number {
    return t
}

export * as Quad from "./quad"
export * as Cubic from "./cubic"
export * as Exp from "./exp"

export function * sequence(count: number, easingFunction: EasingFunction)
    : Generator<ReturnType<EasingFunction>> {
    for (const t of linspace(count)) {
        yield easingFunction(t)
    }
}
