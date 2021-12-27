import { Painter } from "./painter"
import { ISize2D, Rect } from "@/maths"

export interface IPaintDevice {
    readonly painter: Painter,
    readonly rect: Rect,
    readonly size: ISize2D,
}
