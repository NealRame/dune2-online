import { IEntity } from "@/engine/entity"
import { IScene } from "@/engine/scene"

import { Rect, IVector2D, ISize } from "@/maths"
import { IEmitter } from "@/utils"

export interface ITerrainData {
    revealed: boolean
}

export type Neighborhood<Data extends ITerrainData> = [
    ITerrain<Data>|null,
    ITerrain<Data>|null,
    ITerrain<Data>|null,
    ITerrain<Data>|null
]

export interface ITerrain<Data extends ITerrainData> {
    readonly data: Data
    readonly position: IVector2D

    set(data: Partial<Data>): ITerrain<Data>
}

export type TileIndexGetter<Data extends ITerrainData>
    = (t: ITerrain<Data>, n: Neighborhood<Data>) => number

export interface ILandEvent<Data extends ITerrainData> {
    terrainChanged: ITerrain<Data>
}

export interface ILand<Data extends ITerrainData = ITerrainData> extends IEntity {
    readonly size: ISize
    readonly events: IEmitter<ILandEvent<Data>>
    reveal(position?: IVector2D, size?: ISize): ILand<Data>
    terrain(position: IVector2D): ITerrain<Data>|null
    neighborhood(position: IVector2D): Neighborhood<Data>
    terrains(rect?: Rect): Generator<ITerrain<Data>>
}

export type LandDataGenerator<Data extends ITerrainData>
    = (p: IVector2D) => Data

export type LandInitialData<Data extends ITerrainData>
    = Array<Data> | LandDataGenerator<Data>

export type LandConstructor<Data extends ITerrainData>
    = new (scene: IScene, data: LandInitialData<Data>) => ILand<Data>
