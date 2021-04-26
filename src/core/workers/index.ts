/* eslint-disable import/no-webpack-loader-syntax */

import DecodePaletteWorker from "worker-loader!./decode-palette"
import DecodeSoundsetsWorker from "worker-loader!./decode-soundsets"
import DecodeTilesetsWorker from "worker-loader!./decode-tilesets"

import { Palette } from "@/core"

import PromiseWorker from "promise-worker"

const promiseDecodePaletteWorker = new PromiseWorker(new DecodePaletteWorker())
const promiseDecodeSoundsetsWorker = new PromiseWorker(new DecodeSoundsetsWorker())
const promiseDecodeTilesetsWorker = new PromiseWorker(new DecodeTilesetsWorker())

export function decodePalette(data: Uint8Array) : unknown {
    return promiseDecodePaletteWorker.postMessage(data)
}

export function decodeSoundsets(data: Uint8Array) : unknown {
    return promiseDecodeSoundsetsWorker.postMessage(data)
}

export function decodeTilesets(data: Uint8Array, palette: Palette) : unknown {
    return promiseDecodeTilesetsWorker.postMessage({ data, palette })
}
