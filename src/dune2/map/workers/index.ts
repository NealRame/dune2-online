/* eslint-disable import/no-webpack-loader-syntax */
import { Image } from "@/engine"
import { ChunkMessage } from "./types"

import CreateChunkImage from "worker-loader!./create-chunk-image"

import PromiseWorker from "promise-worker"

const promiseCreateChunkImageWorker = new PromiseWorker(new CreateChunkImage())
export function createChunkImage(message: ChunkMessage): Promise<Image> {
    return promiseCreateChunkImageWorker.postMessage(message)
}

export * from "./types"
