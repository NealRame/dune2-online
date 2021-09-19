import { Painter } from "./painter"
import { ISize } from "@/maths"

export interface IPaintDevice {
    readonly painter: Painter,
    readonly size: ISize,
}
