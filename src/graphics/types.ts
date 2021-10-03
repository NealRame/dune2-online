import { Painter } from "./painter"
import { ISize, Rect } from "@/maths"

export interface IPaintDevice {
    readonly painter: Painter,
    readonly rect: Rect,
    readonly size: ISize,
}
