/* eslint-disable import/no-webpack-loader-syntax */
import DecodePaletteWorker from "worker-loader!./workers/decode-palette"
import DecodeImagesWorker from "worker-loader!./workers/decode-images"

import { Image, Palette } from "@/engine/scene"
import { Inject, Service, ServiceLifecycle, Token } from "@/engine/injector"
import {
    IGameImagesDecoder,
    IGamePaletteDecoder,
} from "@/engine/types"

import PromiseWorker from "promise-worker"

export const PaletteIdentifier = new Token<Palette>("palette")

@Service({
    lifecycle: ServiceLifecycle.Singleton
})
export class PaletteDecoder implements IGamePaletteDecoder {
    private worker_: PromiseWorker

    constructor() {
        this.worker_ = new PromiseWorker(new DecodePaletteWorker())
    }

    decode(data: Uint8Array)
        : Promise<Palette> {
        return this.worker_.postMessage(data)
    }
}

export const MiscImagesIdentifier = new Token<Array<Image>>("misc")
export const TerrainImagesIdentifier = new Token<Array<Image>>("terrain")
export const UnitsImagesIdentifier = new Token<Array<Image>>("units")

@Service({
    lifecycle: ServiceLifecycle.Singleton
})
export class ImagesDecoder implements IGameImagesDecoder {
    private worker_: PromiseWorker

    constructor(
        @Inject(PaletteIdentifier) private palette_: Palette
    ) {
        this.worker_ = new PromiseWorker(new DecodeImagesWorker())
    }

    decode(data: Uint8Array, identifier: Token)
        : Promise<Image[]> {
        return this.worker_.postMessage({
            data,
            set: identifier.name,
            palette: this.palette_
        })
    }
}
