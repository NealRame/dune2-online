import { ScaleFactors } from "../../types"

import { base64ToByteArray } from "@/utils"
import { Palette, Image } from "@/core"

import { isNil } from "lodash"
import { ungzip } from "pako"

import registerPromiseWorker from "promise-worker/register"

type Data = {
    w: number,
    h: number,
    data: Uint8Array,
    remap?: Uint8Array,
}

function scaledImageData(item: Data, palette: Palette, scale: number) {
    const image = new ImageData(item.w*scale, item.h*scale)

    for (let row = 0; row < item.h; ++row) {
        const imageRowOffset = 4*scale*row*image.width

        for (let col = 0; col < item.w; ++col) {
            const pixelIndex = row*item.w + col
            const pixelColor = palette[
                isNil(item.remap)
                    ? item.data[pixelIndex]
                    : item.remap[item.data[pixelIndex]]
            ]
            const imagePixelIndex = imageRowOffset + 4*scale*col

            for (let i = 0; i < scale; ++i) {
                image.data.set(pixelColor, imagePixelIndex + 4*i)
            }
        }

        for (let i = 1; i < scale; ++i) {
            image.data.copyWithin(
                imageRowOffset + 4*i*image.width,
                imageRowOffset,
                imageRowOffset + 4*image.width
            )
        }
    }

    return image
}

function ImageCreator(palette: Palette)
    : (i: Data) => Promise<Image> {
    return async data => {
        const image: Partial<Image> = {}
        for (const scale of ScaleFactors) {
            image[scale] = await createImageBitmap(scaledImageData(data, palette, scale))
        }
        return image as Image
    }
}

async function decodeTilesets(inflatedData: string, palette: Palette): Promise<Image[]> {
    const items: Data[] = JSON.parse(
        inflatedData,
        function (key: string, value: unknown) {
            if (key === "data" || key === "remap") {
                return base64ToByteArray(value as string)
            }
            return value
        }
    )
    return await Promise.all(items.map(ImageCreator(palette)))
}

registerPromiseWorker(async ({ data, palette }) => {
    const inflatedData = (new TextDecoder()).decode(ungzip(data))
    return decodeTilesets(inflatedData, palette)
})
