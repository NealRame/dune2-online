/* eslint-disable import/no-webpack-loader-syntax */
import DecodePaletteWorker from "worker-loader!./workers/decode-palette"
import DecodeImagesWorker from "worker-loader!./workers/decode-images"

import * as Engine from "@/engine"

import { Inject, Service, ServiceLifecycle, Token } from "@/engine/injector"
import {
    IGameImagesDecoder,
    IGamePaletteDecoder,
} from "@/engine/types"

import PromiseWorker from "promise-worker"

export const Palette = new Token<Engine.Palette>("palette")

@Service({
    lifecycle: ServiceLifecycle.Singleton
})
export class PaletteDecoder implements IGamePaletteDecoder {
    private worker_: PromiseWorker

    constructor() {
        this.worker_ = new PromiseWorker(new DecodePaletteWorker())
    }

    decode(data: Uint8Array)
        : Promise<Engine.Palette> {
        return this.worker_.postMessage(data)
    }
}

export const MiscImages = new Token<Array<Engine.Image>>("misc")
export const TerrainImages = new Token<Array<Engine.Image>>("terrain")
export const UnitsImages = new Token<Array<Engine.Image>>("units")

@Service({
    lifecycle: ServiceLifecycle.Singleton
})
export class ImagesDecoder implements IGameImagesDecoder {
    private worker_: PromiseWorker

    constructor(
        @Inject(Palette) private palette_: Engine.Palette
    ) {
        this.worker_ = new PromiseWorker(new DecodeImagesWorker())
    }

    decode(data: Uint8Array, identifier: Token)
        : Promise<Engine.Image[]> {
        return this.worker_.postMessage({
            data,
            set: identifier.name,
            palette: this.palette_
        })
    }
}
