import { ScaleFactor } from "@/engine/scale"
import { Viewport } from "@/engine/viewport"
import { Painter } from "@/graphics"
import { Rect, ISize, Vector } from "@/maths"

export type Image = Record<ScaleFactor, ImageBitmap>

export interface Scene {
    readonly size: ISize
    readonly viewport: Viewport
    readonly width: number
    readonly height: number
    readonly gridUnit: number
    readonly gridSpacing: number
    readonly rect: Rect
    scale: ScaleFactor
    addLayer(layer: string|SceneLayer): SceneLayer
    getLayer(layer: string|number): SceneLayer|null
    clear(): Scene
    render(): Scene
    update(): Scene
    zoomIn(): Scene
    zoomOut(): Scene
}

export interface SceneLayer {
    name: string
    readonly scene: Scene
    readonly size: ISize
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
    readonly size: ISize
    readonly rect: Rect
    readonly position: Vector
    render(painter: Painter, viewport: Rect): SceneItem
    update(): SceneItem
}
