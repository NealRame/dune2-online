import { Rect, RectangularCoordinates, Size } from "@/maths"

import { Color } from "@/graphics"
import { Image, SceneItem } from "@/engine"

import { Observer } from "@/utils"

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

export interface Land<T extends Terrain = Terrain> extends SceneItem {
    readonly terrainsObserver: Observer<T>
    terrain(position: RectangularCoordinates): T|null
    terrains(rect: Rect): Generator<Terrain>
}

export type LandConfig = {
    size: Size
    zoneSize?: Size
}