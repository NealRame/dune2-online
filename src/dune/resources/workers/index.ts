/* eslint-disable import/no-webpack-loader-syntax */

import DecodePaletteWorker from "worker-loader!./decode-palette"
import DecodeTileDescriptors from "worker-loader!./decode-tile-descriptors"
import DecodeImagesWorker from "worker-loader!./decode-images"

import { ImageSet, Palette, TileDescriptor } from "@/dune2/types"
import { Image } from "@/engine"
import { IShape2D } from "@/maths"

import PromiseWorker from "promise-worker"

type TileData = {
    shape: IShape2D,
    indexes: number[],
}

const decodePaletteWorker = new PromiseWorker(new DecodePaletteWorker())
export function decodePalette(data: Uint8Array)
    : Promise<Palette> {
    return decodePaletteWorker.postMessage(data)
}

const decodeImagesWorker = new PromiseWorker(new DecodeImagesWorker())
export function decodeImages(data: Uint8Array, set: ImageSet, palette: Palette)
    : Promise<Image[]> {
    return decodeImagesWorker.postMessage({ data, set, palette })
}

const decodeTileDescriptorsWorker = new PromiseWorker(new DecodeTileDescriptors())
export async function decodeTileDescriptors(data: Uint8Array, images: readonly Image[])
    : Promise<TileDescriptor[]> {
    const tileDescriptors = await decodeTileDescriptorsWorker.postMessage(data)
    return (tileDescriptors as TileData[]).map(({ indexes, shape }) => ({
        shape,
        images: indexes.map(index => images[index])
    }))
}
