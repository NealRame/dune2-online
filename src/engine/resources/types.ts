import {
    type TConstructor,
    type Token,
} from "@/engine/injector"

import {
    type Image,
    type Palette,
} from "@/engine/scene"

export type GameResource = Palette | Array<Image>

export interface IGameResourceDecoder<T extends GameResource> {
    decode(data: Uint8Array, identifier: Token<T>, set: string): Promise<T>
}

export type IGamePaletteDecoder = IGameResourceDecoder<Palette>
export type IGameImagesDecoder = IGameResourceDecoder<Array<Image>>

export type IGameResourceDescriptor<T extends GameResource> = {
    name: string,
    uri: string,
    Decoder: TConstructor<IGameResourceDecoder<T>>,
}

export type IGameResourceList = Array<Token<GameResource>>
