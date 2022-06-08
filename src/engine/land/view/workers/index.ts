/* eslint-disable import/no-webpack-loader-syntax */
import { IRenderMessage } from "./types"
import RenderingWorker from "worker-loader!./render"

import { Image } from "@/engine"

import PromiseWorker from "promise-worker"

const renderingWorker = new PromiseWorker(new RenderingWorker())
export function renderImage(message: IRenderMessage)
    : Promise<Image> {
    return renderingWorker.postMessage(message)
}
