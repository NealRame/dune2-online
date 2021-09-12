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
    addLayer(layer: string|ISceneLayer): ISceneLayer
    getLayer(layer: string|number): ISceneLayer|null
    clear(): IScene
    render(): IScene
    update(): IScene
    zoomIn(): IScene
    zoomOut(): IScene
}

export interface ISceneItem {
    readonly scene: IScene
    readonly width: number
    readonly height: number
    readonly size: ISize
    readonly rect: Rect
    readonly position: Vector
    render(painter: Painter, viewport: Rect): ISceneItem
    update(): ISceneItem
}

export interface ISceneLayer extends ISceneItem {
    name: string
    addItem(item: ISceneItem): ISceneLayer
    items(): Generator<ISceneItem>
}
