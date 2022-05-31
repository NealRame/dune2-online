import {
    type IGameResource,
    type IGameResourceList,
} from "@/engine/resources"

import {
    type TConstructor,
    type Token,
} from "@/engine/injector"

import {
    type IPaintDevice
} from "@/graphics"

import {
    type IObservable,
} from "@/utils"

import {
    type ILand,
    type ILandTerrainGenerator,
    type ILandTerrainColorProvider,
    type ILandTerrainTilesProvider,
    type ITerrainData
} from "./land"

/******************************************************************************
 * Game engine metadata
 *****************************************************************************/

/* Game land metadata ********************************************************/
export type IGameLandDescriptor<T extends ITerrainData> = {
    id: Token<ILand<T>>,
    Generator: TConstructor<ILandTerrainGenerator<T>>,
    ColorsProvider: TConstructor<ILandTerrainColorProvider<T>>,
    TilesProvider: TConstructor<ILandTerrainTilesProvider<T>>,
}

/* Game metadata *************************************************************/
export interface IGameMetadata<
    TerrainData extends ITerrainData = ITerrainData,
> {
    resources?: IGameResourceList,
    land: IGameLandDescriptor<TerrainData>,
}

/******************************************************************************
 * Game engine
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
    id: Token<IGameResource>
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

export interface IGameEngine {
    readonly events: IObservable<IGameEvents>
    get<T>(id: Token<T>): T
    initialize(): Promise<IGameEngine>
    start(mode: Mode, screen: IPaintDevice): IGameEngine
    stop(): IGameEngine
}

/******************************************************************************
 * Game module
 *****************************************************************************/
export interface IGameController {
    onStart(engine: IGameEngine): void
    onStop(engine: IGameEngine): void
}
