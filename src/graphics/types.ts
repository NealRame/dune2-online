import { Painter } from "./painter"
import { Rect } from "@/maths"

export interface IPaintDevice {
    readonly painter: Painter,
    readonly rect: Rect,
}
