/* eslint-disable import/no-webpack-loader-syntax */

import DecodeWorker from "worker-loader!./decode"
import TilesetWorker from "worker-loader!./tileset"

import { CreateTileMessage, DecodeMessage, Tile } from "../types"

import PromiseWorker from "promise-worker"

const promiseDecodeWorker = new PromiseWorker(new DecodeWorker())
const promiseTileWorder = new PromiseWorker(new TilesetWorker())

export function decode(message: DecodeMessage) : unknown {
    return promiseDecodeWorker.postMessage(message)
}

export function createTileset(message: CreateTileMessage) : unknown {
    return promiseTileWorder.postMessage(message) as Promise<Tile[]>
}
