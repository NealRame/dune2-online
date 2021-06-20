import { ImageSet, ScaleFactors } from "../../types"

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

enum FlipAxis {
    X  = 1,
    Y  = 2,
    XY = 3,
}

const ImageSetflipAxes: Record<ImageSet, Record<number, FlipAxis[]>> = {
    misc: {},
    terrain: {},
    units: {
        1:   [FlipAxis.X],
        2:   [FlipAxis.X],
        3:   [FlipAxis.X],
        6:   [FlipAxis.X],
        7:   [FlipAxis.X],
        8:   [FlipAxis.X],
        11:  [FlipAxis.X],
        12:  [FlipAxis.X],
        13:  [FlipAxis.X],
        16:  [FlipAxis.X],
        17:  [FlipAxis.X],
        18:  [FlipAxis.X],
        20:  [FlipAxis.Y],
        21:  [FlipAxis.X, FlipAxis.Y, FlipAxis.XY],
        22:  [FlipAxis.X, FlipAxis.Y, FlipAxis.XY],
        23:  [FlipAxis.X, FlipAxis.Y, FlipAxis.XY],
        24:  [FlipAxis.X],
        25:  [FlipAxis.Y],
        26:  [FlipAxis.X, FlipAxis.Y, FlipAxis.XY],
        27:  [FlipAxis.X, FlipAxis.Y, FlipAxis.XY],
        28:  [FlipAxis.X, FlipAxis.Y, FlipAxis.XY],
        29:  [FlipAxis.X],
        30:  [FlipAxis.Y],
        31:  [FlipAxis.X, FlipAxis.Y, FlipAxis.XY],
        32:  [FlipAxis.X, FlipAxis.Y, FlipAxis.XY],
        33:  [FlipAxis.X, FlipAxis.Y, FlipAxis.XY],
        34:  [FlipAxis.X],
        35:  [FlipAxis.Y],
        36:  [FlipAxis.X, FlipAxis.Y, FlipAxis.XY],
        37:  [FlipAxis.X, FlipAxis.Y, FlipAxis.XY],
        38:  [FlipAxis.X, FlipAxis.Y, FlipAxis.XY],
        39:  [FlipAxis.X],
        40:  [FlipAxis.Y],
        41:  [FlipAxis.X, FlipAxis.Y, FlipAxis.XY],
        42:  [FlipAxis.X, FlipAxis.Y, FlipAxis.XY],
        43:  [FlipAxis.X, FlipAxis.Y, FlipAxis.XY],
        44:  [FlipAxis.X],
        45:  [FlipAxis.Y],
        46:  [FlipAxis.X, FlipAxis.Y, FlipAxis.XY],
        47:  [FlipAxis.X],
        48:  [FlipAxis.Y],
        49:  [FlipAxis.X, FlipAxis.Y, FlipAxis.XY],
        50:  [FlipAxis.X],
        51:  [FlipAxis.Y],
        52:  [FlipAxis.Y],
        53:  [FlipAxis.Y],
        54:  [FlipAxis.X, FlipAxis.Y, FlipAxis.XY],
        55:  [FlipAxis.X, FlipAxis.Y, FlipAxis.XY],
        56:  [FlipAxis.X, FlipAxis.Y, FlipAxis.XY],
        57:  [FlipAxis.X],
        58:  [FlipAxis.X],
        59:  [FlipAxis.X],
        60:  [FlipAxis.Y],
        61:  [FlipAxis.X, FlipAxis.Y, FlipAxis.XY],
        62:  [FlipAxis.X],
        66:  [FlipAxis.X],
        67:  [FlipAxis.X],
        68:  [FlipAxis.X],
        76:  [FlipAxis.X],
        77:  [FlipAxis.X],
        78:  [FlipAxis.X],
        85:  [FlipAxis.X],
        86:  [FlipAxis.X],
        87:  [FlipAxis.X],
        95:  [FlipAxis.X],
        96:  [FlipAxis.X],
        97:  [FlipAxis.X],
        98:  [FlipAxis.X],
        107: [FlipAxis.X],
        108: [FlipAxis.X],
        109: [FlipAxis.X],
        110: [FlipAxis.X],
        205: [FlipAxis.X],
        206: [FlipAxis.X],
        207: [FlipAxis.X],
        210: [FlipAxis.X],
        211: [FlipAxis.X],
        212: [FlipAxis.X],
        215: [FlipAxis.X],
        216: [FlipAxis.X],
        217: [FlipAxis.X],
        220: [FlipAxis.X],
        221: [FlipAxis.X],
        222: [FlipAxis.X],
        225: [FlipAxis.X],
        226: [FlipAxis.X],
        227: [FlipAxis.X],
        230: [FlipAxis.X],
        231: [FlipAxis.X],
        232: [FlipAxis.X],
        235: [FlipAxis.X],
        236: [FlipAxis.X],
        237: [FlipAxis.X],
        240: [FlipAxis.X],
        241: [FlipAxis.X],
        242: [FlipAxis.X],
    },
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

function flip(image: Image, flipAxes: number): Image {
    const flippedImage: Partial<Image> = {}
    for (const scale of ScaleFactors) {
        const bitmap = image[scale]
        const offscreen = new OffscreenCanvas(bitmap.width, bitmap.height)
        const context = offscreen.getContext("2d") as OffscreenCanvasRenderingContext2D

        const scaleX = ((flipAxes & FlipAxis.X) === 0) ? 1 : -1
        const scaleY = ((flipAxes & FlipAxis.Y) === 0) ? 1 : -1

        context.scale(scaleX, scaleY)
        context.drawImage(bitmap, 0, 0, scaleX*bitmap.width, scaleY*bitmap.height)

        flippedImage[scale] = offscreen.transferToImageBitmap()
    }
    return flippedImage as Image
}

function ImageCreator(set: ImageSet, palette: Palette)
    : (d: Data, i: number) => Promise<Image[]> {
    return async (data, index) => {
        const image: Partial<Image> = {}
        for (const scale of ScaleFactors) {
            image[scale] = await createImageBitmap(scaledImageData(data, palette, scale))
        }

        const images = [image as Image]
        for (const flipAxes of ImageSetflipAxes[set][index] ?? []) {
            images.push(flip(image as Image, flipAxes))
        }

        return images
    }
}

async function decodeTilesets(inflatedData: string, set: ImageSet, palette: Palette): Promise<Image[]> {
    const items: Data[] = JSON.parse(
        inflatedData,
        function (key: string, value: unknown) {
            if (key === "data" || key === "remap") {
                return base64ToByteArray(value as string)
            }
            return value
        }
    )
    const r = await Promise.all(items.map(ImageCreator(set, palette)))
    return r.flat()
}

registerPromiseWorker(async ({ data, set, palette }) => {
    const inflatedData = (new TextDecoder()).decode(ungzip(data))
    return decodeTilesets(inflatedData, set, palette)
})
