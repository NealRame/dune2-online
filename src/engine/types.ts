import { Image, Palette } from "@/engine/scene"

import { Token } from "@/engine/injector"
import { ILandTerrainGenerator } from "./land"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface TConstructor<T = any> {
    new(...args: Array<never>): T
}

/******************************************************************************
 * ProgressNofier
 *****************************************************************************/
export interface IProgressNotifier {
    begin(): void,
    setLabel(label: string): void,
    setValue(value: number|null): void,
    end(): void,
}

/******************************************************************************
 * Game resources
 *****************************************************************************/
export type GameResourceIdentifier = string | symbol

export type GameResource = Palette | Array<Image>

export interface IGameResourceDecoder<T extends GameResource> {
    decode(data: Uint8Array, identifier: Token<T>): Promise<T>
}

export type IGamePaletteDecoder = IGameResourceDecoder<Palette>
export type IGameImagesDecoder = IGameResourceDecoder<Array<Image>>

export type GameResourceDescriptor<T extends GameResource> = {
    id: Token<T>,
    name: string,
    uri: string,
    decoder: TConstructor<IGameResourceDecoder<T>>,
}

export type GameLandDescriptor = {
    generator: TConstructor<ILandTerrainGenerator>,
}

/******************************************************************************
 * Game metadata types
 *****************************************************************************/
export interface GameMetadata {
    resources?: Array<GameResourceDescriptor<GameResource>>,
    land: GameLandDescriptor,
}
