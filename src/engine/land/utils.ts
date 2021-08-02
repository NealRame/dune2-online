import { RectangularCoordinates, Size } from "@/maths"

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
