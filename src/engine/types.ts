import { Painter } from "@/graphics"

import { Rect, Size, Vector } from "@/maths"

export const ScaleFactors = [1, 2, 3, 4] as const
export type ScaleFactor = typeof ScaleFactors[number]

export type Image = Record<ScaleFactor, ImageBitmap>

export interface Scene {
    scale: ScaleFactor
    size: Size
    viewport: Rect
    readonly width: number
    readonly height: number
    readonly gridUnit: number
    readonly gridSpacing: number
    gridEnabled: boolean
    readonly rect: Rect
    addLayer(name: string): SceneLayer
    clear(): Scene
    render(painter: Painter): Scene
    run(painter: Painter): Scene
    update(): Scene
}

export interface SceneLayer {
    name: string
    readonly scene: Scene
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
