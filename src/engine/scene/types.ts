import { ScaleFactor } from "@/engine/scale"
import { IViewport } from "@/engine/viewport"
import { Painter } from "@/graphics"
import { Rect, ISize, Vector } from "@/maths"

export type Image = Record<ScaleFactor, ImageBitmap>

export interface IScene {
    readonly size: ISize
    readonly viewport: IViewport
    readonly width: number
    readonly height: number
    readonly gridUnit: number
    readonly gridSpacing: number
    readonly rect: Rect
    scale: ScaleFactor
    addLayer(layer: string|SceneLayer): SceneLayer
    getLayer(layer: string|number): SceneLayer|null
    clear(): IScene
    render(): IScene
    update(): IScene
    zoomIn(): IScene
    zoomOut(): IScene
}

export interface SceneLayer {
    name: string
    readonly scene: IScene
    readonly size: ISize
    readonly rect: Rect
    addItem(item: SceneItem): SceneLayer
    items(): Generator<SceneItem>
    render(painter: Painter): SceneLayer
    update(): SceneLayer
}

export interface SceneItem {
    readonly scene: IScene
    readonly width: number
    readonly height: number
    readonly size: ISize
    readonly rect: Rect
    readonly position: Vector
    render(painter: Painter, viewport: Rect): SceneItem
    update(): SceneItem
}
