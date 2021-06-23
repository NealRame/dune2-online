import { Painter } from "@/graphics"

import { Rect, Size, Vector } from "@/maths"

export const ScaleFactors = [1, 2, 3, 4] as const
export type ScaleFactor = typeof ScaleFactors[number]

export type Image = Record<ScaleFactor, ImageBitmap>

export interface Scene {
    scale: ScaleFactor,
    viewport: Rect | null,
    readonly gridUnit: number,
    readonly gridSpacing: number,
    gridEnabled: boolean,
    readonly rect: Rect,
    addItem(item: SceneItem): Scene, // eslint-disable-line no-use-before-define
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
    position: Vector,
    render(painter: Painter, viewport: Rect): SceneItem,
    update(): SceneItem,
}
