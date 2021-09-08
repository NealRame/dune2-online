import { Rect, IVector2D, ISize } from "@/maths"

import { Image, ISceneLayer } from "@/engine"
import { Color } from "@/graphics"

export type Neighborhood<T extends ITerrain> = [T|null, T|null, T|null, T|null]

export interface ITerrain {
    readonly x: number
    readonly y: number

    readonly position: IVector2D
    readonly revealed: boolean

    readonly neighbors: Neighborhood<ITerrain>

    readonly color: Color.RGBA

    image(): Image[]
    reveal(): ITerrain
    update(): ITerrain
}

export type TerrainGenerator<T extends ITerrain> = (l: ILand<T>, p: IVector2D) => T

export interface ILand<T extends ITerrain = ITerrain> extends ISceneLayer {
    readonly size: ISize
    readonly fogOfWar: boolean
    reveal(position?: IVector2D, size?: ISize): ILand<T>
    terrain(position: IVector2D): T|null
    terrains(rect?: Rect): Generator<ITerrain>
    onTerrainChanged(callback: (terrain: T) => void): () => void
    updateTerrain(terrain: T): ILand<T>
}

export type ILandConfig<T extends ITerrain> = {
    generateTerrain: TerrainGenerator<T>
    chunkSize?: ISize,
    chunkEnabled?: boolean,
    fogOfWarEnabled?: boolean,
}
