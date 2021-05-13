import { Painter } from "./painter"
import { Rect } from "@/maths"
export interface PaintDevice {
    readonly painter: Painter,
    readonly rect: Rect,
}
