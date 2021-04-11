import { Painter } from "./painter"

export interface PaintDevice {
    painter(): Painter
}
