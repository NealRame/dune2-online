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
    reset: ISize2D
    terrainChanged: ITerrain<Data>
}

export interface ILandConfig {
    size: ISize2D
}

export interface ILandTerrainGenerator<
    TerrainDataType extends ITerrainData = ITerrainData,
    LandConfigType extends ILandConfig = ILandConfig,
> {
    generate(config: LandConfigType): Array<TerrainDataType>
}

export interface ILandTerrainTilesProvider<Data extends ITerrainData = ITerrainData> {
    getFogTile(terrain: ITerrain<Data>, neighbors: Neighborhood<Data>): Image | null
    getTerrainTile(terrain: ITerrain<Data>, neighbors: Neighborhood<Data>): Image | null
}

export interface ILandTerrainColorProvider<Data extends ITerrainData = ITerrainData> {
    getTerrainColor(terrain: ITerrain<Data>): Color.RGBA
}

export interface ILand<
    TerrainDataType extends ITerrainData = ITerrainData,
    LandConfigType extends ILandConfig = ILandConfig,
> {
    readonly width: number
    readonly height: number
    readonly size: ISize2D
    readonly events: IObservable<ILandEvent<TerrainDataType>>

    generate(config: LandConfigType): ILand<TerrainDataType>
    load(size: ISize2D, terrains: Array<TerrainDataType>): ILand<TerrainDataType>

    reveal(position?: IVector2D, size?: ISize2D): ILand<TerrainDataType>
    neighborhood(position: IVector2D): Neighborhood<TerrainDataType>
    terrain(position: IVector2D): ITerrain<TerrainDataType> | null
    terrains(rect?: Rect): Generator<ITerrain<TerrainDataType>>
}
