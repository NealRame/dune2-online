export type LinSpaceConfig = {
    first?: number,
    last?: number,
}

export function * linspace(count: number, config: LinSpaceConfig = {})
    : Generator<number> {
    const first = config.first ?? 0
    const last = config.last ?? 1
    const step = (last - first)/(count - 1)

    for (let i = 0; i < count; ++i) {
        yield i*step
    }
}
