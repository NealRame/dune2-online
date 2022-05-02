import { Image, Palette } from "@/engine/scene"

import { Token } from "@/engine/injector"

import {
    type IPaintDevice
} from "@/graphics"

import {
    type IObservable,
} from "@/utils"

import {
    ILand,
    ILandTerrainGenerator,
    ILandTerrainColorProvider,
    ILandTerrainTilesProvider,
    ITerrainData
} from "./land"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface TConstructor<T = any> {
    new(...args: Array<never>): T
}

/******************************************************************************
 * Game state
 *****************************************************************************/

export enum Mode {
    Editor,
    Game,
}

export enum State {
    Initializing = 0,
    Ready,
    Running,
    Paused,
}

export interface IGameResourceEvent {
    id: Token<GameResource>
    name: string
    current?: number
    total?: number
}

export interface IGameEvents {
    downloadingResourceBegin: IGameResourceEvent
    downloadingResourceProgress: IGameResourceEvent
    downloadingResourceEnd: IGameResourceEvent

    decodingResourceBegin: IGameResourceEvent
    decodingResourceProgress: IGameResourceEvent
    decodingResourceEnd: IGameResourceEvent

    stateChanged: State
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

export type IGameResourceDescriptor<T extends GameResource> = {
    id: Token<T>,
    name: string,
    uri: string,
    Decoder: TConstructor<IGameResourceDecoder<T>>,
}

export type IGameLandDescriptor<T extends ITerrainData> = {
    id: Token<ILand<T>>,
    Generator: TConstructor<ILandTerrainGenerator<T>>,
    ColorsProvider: TConstructor<ILandTerrainColorProvider<T>>,
    TilesProvider: TConstructor<ILandTerrainTilesProvider<T>>,
}

/******************************************************************************
 * Game metadata types
 *****************************************************************************/

export interface IGameEngine {
    readonly events: IObservable<IGameEvents>
    get<T>(id: Token<T>): T
    initialize(): Promise<IGameEngine>
    start(mode: Mode, screen: IPaintDevice): IGameEngine
    stop(): IGameEngine
}

export interface IGameModule {
    onStart(engine: IGameEngine): void
    onStop(engine: IGameEngine): void
}

export interface IGameMetadata<
    TerrainData extends ITerrainData = ITerrainData,
> {
    resources?: Array<IGameResourceDescriptor<GameResource>>,
    land: IGameLandDescriptor<TerrainData>,
}
