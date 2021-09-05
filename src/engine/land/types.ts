import { Rect, RectangularCoordinates, Size } from "@/maths"

import { Image, SceneLayer } from "@/engine"
import { Color } from "@/graphics"

export type Neighborhood<T extends Terrain> = [T|null, T|null, T|null, T|null]

export interface Terrain {
    readonly x: number
    readonly y: number

    readonly position: RectangularCoordinates
    readonly revealed: boolean

    readonly neighbors: Neighborhood<Terrain>

    readonly color: Color.RGBA

    image(): Image[]
    reveal(): Terrain
    update(): Terrain
}

export type TerrainGenerator<T extends Terrain> = (l: Land<T>, p: RectangularCoordinates) => T

export interface Land<T extends Terrain = Terrain> extends SceneLayer {
    readonly size: Size
    readonly fogOfWar: boolean
    reveal(position?: RectangularCoordinates, size?: Size): Land<T>
    terrain(position: RectangularCoordinates): T|null
    terrains(rect?: Rect): Generator<Terrain>
    onTerrainChanged(callback: (terrain: T) => void): () => void
    updateTerrain(terrain: T): Land<T>
}

export type LandConfig<T extends Terrain> = {
    generateTerrain: TerrainGenerator<T>
    chunkSize?: Size,
    chunkEnabled?: boolean,
    fogOfWarEnabled?: boolean,
}
