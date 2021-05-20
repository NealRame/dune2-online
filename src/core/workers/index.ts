/* eslint-disable import/no-webpack-loader-syntax */

import DecodePaletteWorker from "worker-loader!./decode-palette"
import DecodeImagesWorker from "worker-loader!./decode-images"

import { Palette } from "@/core"

import PromiseWorker from "promise-worker"

const promiseDecodePaletteWorker = new PromiseWorker(new DecodePaletteWorker())
const promiseDecodeImagesWorker = new PromiseWorker(new DecodeImagesWorker())

export function decodePalette(data: Uint8Array) : unknown {
    return promiseDecodePaletteWorker.postMessage(data)
}

export function decodeImages(data: Uint8Array, palette: Palette) : unknown {
    return promiseDecodeImagesWorker.postMessage({ data, palette })
}
