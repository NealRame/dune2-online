import { Painter } from "./painter"
import { RectangularCoordinates, Size } from "@/maths"
export interface PaintDevice {
    painter(): Painter
}

export type ScaleFactor = 1 | 2 | 3 | 4
export interface SceneItem extends RectangularCoordinates, Size {
    draw(painter: Painter): SceneItem,
    scale: ScaleFactor,
}
