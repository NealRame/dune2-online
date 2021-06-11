import { Image } from "@/core/types"
import { Size } from "@/maths"

export type ChunkMessage = {
    chunkSize: Size,
    images: Image[],
}
