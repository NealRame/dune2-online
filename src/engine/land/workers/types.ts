import { Image } from "@/engine"
import { ISize2D, IVector2D } from "@/maths"

export interface IRenderMessage {
    image: Partial<Image>
    tiles: Array<[IVector2D, Array<Image>]>
    gridUnit: number
    size: ISize2D
}
