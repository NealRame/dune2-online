import { range } from "lodash"

export type LinSpaceConfig = {
    first?: number,
    last?: number,
}

export function linspace(len: number, config: LinSpaceConfig = {}): number[] {
    const first = config.first ?? 0
    const last = config.last ?? 0
    const a = range(first, last, (last - first)/(len - 1))
    a.push(last)
    return a
}
