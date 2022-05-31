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

export const Palette: Token<Engine.Palette> = Symbol("palette")

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

export const MiscImages: Token<Array<Engine.Image>> = Symbol("misc")
export const TerrainImages: Token<Array<Engine.Image>> = Symbol("terrain")
export const UnitsImages: Token<Array<Engine.Image>> = Symbol("units")

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

    decode(data: Uint8Array, identifier: Token, set: string)
        : Promise<Engine.Image[]> {
        return this.worker_.postMessage({
            data,
            set,
            palette: this.palette_
        })
    }
}
