import { Neighborhood, Terrain } from "@/core/types"
import { RectangularCoordinates, Size, Rect } from "@/maths"

export function indexToPositionConverter({ width }: Size)
    : (n: number) => RectangularCoordinates {
    return n => ({ x: n%width, y: Math.floor(n/width) })
}

export function positionToIndexConverter(
    { width, height }: Size,
    origin?: RectangularCoordinates
): (p: RectangularCoordinates) => number {
    return ({ x, y }) => {
        x += origin?.x ?? 0
        y += origin?.y ?? 0
        return x >= 0 && x < width && y >= 0 && y < height
            ? y*width + x
            : -1
    }
}

export function neighborhood<T extends Terrain>(size: Size)
    : (t: T, m: T[]) => Neighborhood<T> {
    const positionToIndex = positionToIndexConverter(size)
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

export function partition(mapSize: Size, chunkSize: Size): Rect[] {
    const chunks: Rect[] = []

    for (let y = 0; y < mapSize.height; y += chunkSize.height) {
        for (let x = 0; x < mapSize.width; x += chunkSize.width) {
            const width = Math.min(chunkSize.width, mapSize.width - x)
            const height = Math.min(chunkSize.height, mapSize.height - y)
            chunks.push(new Rect({ x, y }, { width, height }))
        }
    }

    return chunks
}
