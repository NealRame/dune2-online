import { IViewport } from "@/engine/viewport"
import { ScaleFactor } from "@/engine/scale"

import { Color, IPaintDevice, Painter } from "@/graphics"
import { Rect, ISize2D, Vector } from "@/maths"
import { IObservable } from "@/utils"

export type Palette = readonly Color.RGBA[]

export type Image = Record<ScaleFactor, ImageBitmap>

export interface ISceneEvents {
    scaledChanged: ScaleFactor
    screenChanged: IPaintDevice | null
    sizeChanged: ISize2D
}

export interface IScene extends ISceneLayer {
    readonly gridUnit: number
    readonly gridSpacing: number
    readonly events: IObservable<ISceneEvents>
    readonly viewport: IViewport
    scale: ScaleFactor
    screen: IPaintDevice | null
    size: ISize2D
    zoomIn(): IScene
    zoomOut(): IScene
}

export interface ISceneItem {
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
