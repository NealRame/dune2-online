/* eslint-disable import/no-webpack-loader-syntax */
import CreateChunkImage from "worker-loader!./create-chunk-image"

import { Image } from "@/engine"
import { Shape } from "@/maths"

import PromiseWorker from "promise-worker"

const promiseCreateChunkImageWorker = new PromiseWorker(new CreateChunkImage())

export type ChunkMessage = {
    shape: Shape,
    images: Image[],
}

export function createChunkImage(message: ChunkMessage): Promise<Image> {
    return promiseCreateChunkImageWorker.postMessage(message)
}
