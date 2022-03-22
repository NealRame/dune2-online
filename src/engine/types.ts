import { Image, Palette } from "@/engine/scene"

import { Token } from "@/engine/injector"
import { ILand, ILandTerrainGenerator, ILandTerrainTilesProvider, ITerrainData } from "./land"

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

export type GameLandDescriptor<T extends ITerrainData> = {
    id: Token<ILand<T>>,
    generator: TConstructor<ILandTerrainGenerator<T>>,
    tilesProvider: TConstructor<ILandTerrainTilesProvider<T>>,
}

/******************************************************************************
 * Game metadata types
 *****************************************************************************/
export interface GameMetadata<
    TerrainData extends ITerrainData = ITerrainData,
> {
    resources?: Array<GameResourceDescriptor<GameResource>>,
    land: GameLandDescriptor<TerrainData>,
}
