import { Painter } from "./painter"
import { RectangularCoordinates, Size } from "@/maths"

export interface PaintDevice {
    painter(): Painter
}

export interface SceneItem extends RectangularCoordinates, Size {
    draw(painter: Painter): SceneItem
}
