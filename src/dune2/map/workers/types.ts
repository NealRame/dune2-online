import { Image } from "@/engine"
import { Shape } from "@/maths"

export type ChunkMessage = {
    shape: Shape,
    images: Image[],
}
