import { ScaleFactor, Viewport } from "@/engine/types"
import { Painter } from "@/graphics"
import { Rect, Size, Vector } from "@/maths"

export interface Scene {
    readonly size: Size
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
