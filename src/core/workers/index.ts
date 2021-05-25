/* eslint-disable import/no-webpack-loader-syntax */
import { Image, TileDescriptor } from "../types"

import DecodePaletteWorker from "worker-loader!./decode-palette"
import DecodeTileDescriptors from "worker-loader!./decode-tile-descriptors"
import DecodeImagesWorker from "worker-loader!./decode-images"

import { Palette } from "@/core"

import PromiseWorker from "promise-worker"

const promiseDecodePaletteWorker = new PromiseWorker(new DecodePaletteWorker())
export function decodePalette(data: Uint8Array): Promise<Palette> {
    return promiseDecodePaletteWorker.postMessage(data)
}

const promiseDecodeTileDescriptorsWorker = new PromiseWorker(new DecodeTileDescriptors())
export function decodeTileDescriptors(data: Uint8Array): Promise<TileDescriptor[]> {
    return promiseDecodeTileDescriptorsWorker.postMessage(data)
}

const promiseDecodeImagesWorker = new PromiseWorker(new DecodeImagesWorker())
export function decodeImages(data: Uint8Array, palette: Palette): Promise<Image[]> {
    return promiseDecodeImagesWorker.postMessage({ data, palette })
}
