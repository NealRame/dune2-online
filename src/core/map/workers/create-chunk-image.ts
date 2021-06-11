import { ChunkMessage } from "./types"

import { Image, ScaleFactor, ScaleFactors } from "@/core/types"
import { positionToIndexConverter } from "@/core/map/utils"

import registerPromiseWorker from "promise-worker/register"

function chunkImageBitmapCreator({
    chunkSize,
    images,
}: ChunkMessage)
    : (scale: ScaleFactor) => Partial<Image> {
    const { width, height } = chunkSize
    const positionToIndex = positionToIndexConverter(chunkSize)
    return scale => {
        const canvas = new OffscreenCanvas(16*scale*width, 16*scale*height)
        const context = canvas.getContext("2d") as OffscreenCanvasRenderingContext2D

        for (let y = 0; y < height; ++y) {
            for (let x = 0; x < width; ++x) {
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
