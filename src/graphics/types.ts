import { Painter } from "./painter"
import { Rect, RectangularCoordinates, Size } from "@/maths"
export interface PaintDevice {
    painter(): Painter,
    rect(): Rect,
}

export type ScaleFactor = 1 | 2 | 3 | 4

export interface Scene {
    scale: ScaleFactor,
    viewport: Rect | null,
    gridEnabled: boolean,
    readonly gridSpacing: number,
    readonly rect: Rect,
    addItem(item: SceneItem): Scene, // eslint-disable-line no-use-before-define
    clear(): Scene,
    render(painter: Painter): Scene,
    run(painter: Painter): Scene,
}

export interface SceneItem extends RectangularCoordinates, Size {
    parent: Scene | SceneItem | null,
    readonly rect: Rect,
    readonly scale: ScaleFactor,
    render(painter: Painter, viewport: Rect): SceneItem,
}
