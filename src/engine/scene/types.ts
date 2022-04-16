import { IEntity } from "@/engine/entity"
import { IViewport } from "@/engine/viewport"
import { ScaleFactor } from "@/engine/scale"

import { Color, Painter } from "@/graphics"
import { Rect, ISize2D, Vector } from "@/maths"
import { IObservable } from "@/utils"

export type Palette = readonly Color.RGBA[]

export type Image = Record<ScaleFactor, ImageBitmap>

export interface ISceneEvents {
    scaledChanged: ScaleFactor
}

export interface IScene extends ISceneLayer {
    readonly viewport: IViewport
    readonly gridUnit: number
    readonly gridSpacing: number
    readonly events: IObservable<ISceneEvents>
    size: ISize2D
    scale: ScaleFactor
    zoomIn(): IScene
    zoomOut(): IScene
}

export interface ISceneItem {
    readonly entity: IEntity | null
    readonly scene: IScene
    readonly width: number
    readonly height: number
    readonly size: ISize2D
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
