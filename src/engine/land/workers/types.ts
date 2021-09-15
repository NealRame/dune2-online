import { Image } from "@/engine"
import { ISize, IVector2D } from "@/maths"

export interface IRenderMessage {
    image: Partial<Image>
    tiles: Array<[IVector2D, Array<Image>]>
    gridUnit: number
    size: ISize
}
