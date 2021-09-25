import { IViewport } from "@/engine/viewport"
import { ScaleFactor } from "@/engine/scale"
import { Painter } from "@/graphics"
import { Rect, ISize, Vector } from "@/maths"

export type Image = Record<ScaleFactor, ImageBitmap>

export interface IScene extends ISceneLayer {
    readonly viewport: IViewport
    readonly gridUnit: number
    readonly gridSpacing: number
    scale: ScaleFactor
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
    readonly x: number
    readonly y: number
    visible: boolean
    render(painter?: Painter, viewport?: Rect): ISceneItem
}

export interface ISceneLayer extends ISceneItem {
    addItem(item: ISceneItem): ISceneLayer
    removeItem(item: ISceneItem): ISceneLayer
    clear(): ISceneLayer
    items(): Generator<ISceneItem>
}
