import { Painter } from "@/graphics"
import { Rect, RectangularCoordinates, Size, Vector } from "@/maths"
import { Observer } from "@/utils"

export const ScaleFactors = [1, 2, 3, 4] as const
export type ScaleFactor = typeof ScaleFactors[number]

export type Image = Record<ScaleFactor, ImageBitmap>

export interface Viewport {
    readonly onChanged: Observer<Rect>
    readonly rect: Rect
    position: RectangularCoordinates
    size: Size
}

export interface Scene {
    readonly size: Size
    readonly viewport: Viewport
    readonly width: number
    readonly height: number
    readonly gridUnit: number
    readonly gridSpacing: number
    readonly rect: Rect
    scale: ScaleFactor
    gridEnabled: boolean
    addLayer(layer: string|SceneLayer): SceneLayer
    clear(): Scene
    render(): Scene
    update(): Scene
    run(): Scene
    stop(): Scene
}

export interface SceneLayer {
    name: string
    readonly scene: Scene
    readonly size: Size
    readonly rect: Rect
    addItem(item: SceneItem): SceneLayer
    items(): Generator<SceneItem>
    render(painter: Painter): SceneLayer
    update(): SceneLayer
}

export interface SceneItem {
    readonly scene: Scene
    readonly width: number
    readonly height: number
    readonly size: Size
    readonly rect: Rect
    readonly position: Vector
    render(painter: Painter, viewport: Rect): SceneItem
    update(): SceneItem
}
