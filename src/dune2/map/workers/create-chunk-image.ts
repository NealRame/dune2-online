import { ChunkMessage } from "./types"

import { positionToIndexConverter } from "@/dune2/map/utils"
import { Image, ScaleFactor, ScaleFactors } from "@/engine"

import registerPromiseWorker from "promise-worker/register"

function chunkImageBitmapCreator({
    shape,
    images,
}: ChunkMessage)
    : (scale: ScaleFactor) => Partial<Image> {
    const { columns, rows } = shape
    const positionToIndex = positionToIndexConverter({
        width: columns,
        height: rows,
    })
    return scale => {
        const canvas = new OffscreenCanvas(16*scale*columns, 16*scale*rows)
        const context = canvas.getContext("2d") as OffscreenCanvasRenderingContext2D

        for (let y = 0; y < rows; ++y) {
            for (let x = 0; x < columns; ++x) {
                const index = positionToIndex({ x, y })
                const bitmap = images[index][scale]
                context.drawImage(
                    bitmap,
                    x*bitmap.width,
                    y*bitmap.height,
                )
            }
        }

        return { [scale]: canvas.transferToImageBitmap() }
    }
}

function createChunkImage(message: ChunkMessage): Promise<Image> {
    return Promise.resolve(Object.assign(
        {},
        ...ScaleFactors.map(chunkImageBitmapCreator(message))
    ))
}

registerPromiseWorker(createChunkImage)
