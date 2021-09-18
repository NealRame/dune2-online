import { ISize, IVector2D } from "@/maths"

export type PositionToIndexConverter = (p: IVector2D) => number
export function createPositionToIndexConverter({ width, height }: ISize)
    : PositionToIndexConverter {
    return ({ x, y }) => {
        if ((x >= 0 && x < width) && (y >= 0 && y < height)) {
            return width*y + x
        }
        return -1
    }
}

export type IndexToPositionConverter = (i: number) => IVector2D
export function createIndexToPositionConverter({ width }: ISize)
    : IndexToPositionConverter {
    return index => {
        return {
            x: index%width,
            y: Math.floor(index/width)
        }
    }
}
