import { ISize, IVector2D } from "@/maths"

export type PositionToIndexConverter = (p: IVector2D) => number
export function createPositionToIndexConverter(
    { width, height }: ISize,
    chunkSize?: ISize,
): PositionToIndexConverter {
    const chunkWidth = chunkSize?.width ?? 1
    const chunkHeight = chunkSize?.height ?? 1

    const colCount = Math.ceil(width/chunkWidth)
    const rowCount = Math.ceil(height/chunkHeight)

    return ({ x, y }: IVector2D): number => {
        const col = Math.floor(x/chunkWidth)
        const row = Math.floor(y/chunkHeight)

        if (col >= 0 && col < colCount && row >= 0 && row < rowCount) {
            return colCount*row + col
        }
        return -1
    }
    //     return ({ x, y }) => {
    //     if ((x >= 0 && x < width) && (y >= 0 && y < height)) {
    //         return width*y + x
    //     }
    //     return -1
    // }
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
