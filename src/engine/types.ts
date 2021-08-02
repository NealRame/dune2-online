import { Painter } from "@/graphics"
import { RGBA } from "@/graphics/color"

import { Rect, RectangularCoordinates, Size, Vector } from "@/maths"

export const ScaleFactors = [1, 2, 3, 4] as const
export type ScaleFactor = typeof ScaleFactors[number]

export type Image = Record<ScaleFactor, ImageBitmap>

export enum Direction {
    North,
    Northeast,
    East,
    Southeast,
    South,
    Southwest,
    West,
    Northwest,
}
export const DirectionCount = Direction.Northwest + 1

export interface Scene {
    scale: ScaleFactor,
    viewport: Rect | null,
    readonly gridUnit: number,
    readonly gridSpacing: number,
    gridEnabled: boolean,
    readonly rect: Rect,
    addItem(item: SceneItem): Scene,
    clear(): Scene,
    render(painter: Painter): Scene,
    run(painter: Painter): Scene,
    update(): Scene,
}

export interface SceneItem {
    readonly scene: Scene,
    readonly width: number,
    readonly height: number,
    readonly size: Size,
    readonly rect: Rect,
    readonly position: Vector,
    render(painter: Painter, viewport: Rect): SceneItem,
    update(): SceneItem,
}

export type Neighborhood<T extends Terrain> = [T|null, T|null, T|null, T|null]

export interface Terrain {
    readonly revealed: boolean
    readonly position: RectangularCoordinates
    readonly color: RGBA
    image(neighbors: Neighborhood<Terrain>): Image
}
