/* eslint-disable import/no-webpack-loader-syntax */
import DecodePaletteWorker from "worker-loader!./workers/decode-palette"
import DecodeImagesWorker from "worker-loader!./workers/decode-images"

import * as Engine from "@/engine"

import {
    Inject,
    Service,
    type Token
} from "@/engine/injector"

import {
    type IGameImagesDecoder,
    type IGamePaletteDecoder,
} from "@/engine/resources"

import PromiseWorker from "promise-worker"

export const Palette: Token<Engine.Palette> = Symbol("palette")

@Service()
class PaletteDecoder implements IGamePaletteDecoder {
    private worker_: PromiseWorker

    constructor() {
        this.worker_ = new PromiseWorker(new DecodePaletteWorker())
    }

    decode(data: Uint8Array)
        : Promise<Engine.Palette> {
        return this.worker_.postMessage(data)
    }
}

export const MiscImages: Token<Array<Engine.Image>> = Symbol("resources:images:misc")
export const TerrainImages: Token<Array<Engine.Image>> = Symbol("resources:images:terrain")
export const UnitsImages: Token<Array<Engine.Image>> = Symbol("resources:images:units")

@Service()
class ImagesDecoder implements IGameImagesDecoder {
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

Engine.Resources.define(Palette, {
    name: "palette",
    uri: "/assets/palette.json.gz",
    Decoder: PaletteDecoder,
})

Engine.Resources.define(MiscImages, {
    name: "misc",
    uri: "/assets/images.misc.json.gz",
    Decoder: ImagesDecoder,
})

Engine.Resources.define(TerrainImages, {
    name: "terrain",
    uri: "/assets/images.terrain.json.gz",
    Decoder: ImagesDecoder,
})

Engine.Resources.define(UnitsImages, {
    name: "units",
    uri: "/assets/images.units.json.gz",
    Decoder: ImagesDecoder,
})
