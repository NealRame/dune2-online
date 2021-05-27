import { Neighborhood, Shape, Terrain } from "@/core/types"
import { RectangularCoordinates } from "@/maths"

export function indexToPositionConverter({ columns }: Shape)
    : (n: number) => RectangularCoordinates {
    return n => ({ x: n%columns, y: Math.floor(n/columns) })
}

export function positionToIndexConverter({ columns, rows }: Shape)
    : (p: RectangularCoordinates) => number {
    return ({ x, y }) => {
        return x >= 0 && x < columns && y >= 0 && y < rows
            ? y*columns + x
            : -1
    }
}

export function neighborhood<T extends Terrain>(shape: Shape)
    : (t: T, m: T[]) => Neighborhood<T> {
    const positionToIndex = positionToIndexConverter(shape)
    return (terrain, map) => {
        const { x, y } = terrain.position
        const north = positionToIndex({ x, y: y - 1 })
        const east  = positionToIndex({ x: x + 1, y })
        const south = positionToIndex({ x, y: y + 1 })
        const west  = positionToIndex({ x: x - 1, y })
        return [
            north >= 0 ? map[north] : null,
            east  >= 0 ? map[east]  : null,
            south >= 0 ? map[south] : null,
            west  >= 0 ? map[west]  : null,
        ]
    }
}
