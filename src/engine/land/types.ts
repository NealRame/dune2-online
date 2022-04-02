import { IEntity } from "@/engine/entity"
import { Image } from "@/engine/scene"

import { Color } from "@/graphics"

import { Rect, IVector2D, ISize2D } from "@/maths"

import { IObservable } from "@/utils"

export interface ITerrainData {
    revealed: boolean
}

export type Neighborhood<Data extends ITerrainData> = [
    ITerrain<Data>|null,
    ITerrain<Data>|null,
    ITerrain<Data>|null,
    ITerrain<Data>|null,
]

export interface ITerrain<Data extends ITerrainData> {
    readonly data: Data
    readonly position: IVector2D

    set(data: Partial<Data>): ITerrain<Data>
}

export type TileIndexGetter<Data extends ITerrainData>
    = (t: ITerrain<Data>, n: Neighborhood<Data>) => number

export interface ILandEvent<Data extends ITerrainData = ITerrainData> {
    terrainChanged: ITerrain<Data>
}

export type ILandConfig = Record<string, unknown>

export interface ILandConfigProvider<Config extends ILandConfig> {
    getConfig(): Config
}

export interface ILandTerrainGenerator<Data extends ITerrainData = ITerrainData> {
    generate(size: ISize2D): Array<Data>
}

export interface ILandTerrainTilesProvider<Data extends ITerrainData = ITerrainData> {
    getFogTile(terrain: ITerrain<Data>, neighbors: Neighborhood<Data>): Image | null
    getTerrainTile(terrain: ITerrain<Data>, neighbors: Neighborhood<Data>): Image | null
}

export interface ILandTerrainColorProvider<Data extends ITerrainData = ITerrainData> {
    getTerrainColor(terrain: ITerrain<Data>): Color.RGBA
}

export interface ILand<Data extends ITerrainData = ITerrainData> extends IEntity {
    readonly size: ISize2D
    readonly events: IObservable<ILandEvent<Data>>
    reset(): ILand<Data>
    reveal(position?: IVector2D, size?: ISize2D): ILand<Data>
    neighborhood(position: IVector2D): Neighborhood<Data>
    terrain(position: IVector2D): ITerrain<Data>|null
    terrains(rect?: Rect): Generator<ITerrain<Data>>
}
