import { Painter } from "./painter"
import { Rect, RectangularCoordinates, Size } from "@/maths"
export interface PaintDevice {
    painter(): Painter,
    rect(): Rect,
}

export type ScaleFactor = 1 | 2 | 3 | 4

export interface SceneItem extends RectangularCoordinates, Size {
    getScale(): ScaleFactor,
    getParent(): SceneItem | null,
    setParent(parent: SceneItem | null): SceneItem,
    render(painter: Painter): SceneItem,
}
