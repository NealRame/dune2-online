import { Image } from "@/core/types"
import { RectangularCoordinates, Size } from "@/maths"

export type ChunkMessage = {
    chunkPosition: RectangularCoordinates,
    chunkSize: Size,
    mapSize: Size,
    images: Image[],
}
