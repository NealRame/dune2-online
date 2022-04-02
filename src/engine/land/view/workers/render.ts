import { IRenderMessage } from "./types"

import { ScaleFactor, ScaleFactors } from "@/engine/scale"
import { Image } from "@/engine/scene"

import registerPromiseWorker from "promise-worker/register"
import { isNil } from "lodash"

function renderBitmap(
    message: IRenderMessage,
    scale: ScaleFactor,
) : ImageBitmap {
    const { width, height } = message.size
    const gridSpacing = scale*message.gridUnit

    const canvas = new OffscreenCanvas(width*gridSpacing, height*gridSpacing)
    const context = canvas.getContext("2d") as OffscreenCanvasRenderingContext2D

    const bitmap = message.image[scale]
    if (!isNil(bitmap)) {
        context.drawImage(bitmap, 0, 0)
    }

    for (const [{ x, y }, images] of message.tiles) {
        for (const image of images) {
            context.drawImage(
                image[scale],
                x*gridSpacing,
                y*gridSpacing,
            )
        }
    }

    return canvas.transferToImageBitmap()
}

registerPromiseWorker(async (message: IRenderMessage) => {
    const image: Partial<Image> = {}
    for (const scale of ScaleFactors) {
        image[scale] = renderBitmap(
            message,
            scale,
        )
    }
    return image
})
