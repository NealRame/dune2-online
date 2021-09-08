import { Structure } from "./structure"

import { createTile } from "@/core/tile"
import { imageSet } from "@/dune2/data"

import { IVector2D } from "@/maths"

export class ConcreteSlab extends Structure {
    constructor(position: IVector2D) {
        super(position)

        const terrain = imageSet("terrain")
        for (const image of [terrain[126], terrain[124], terrain[125]]) {
            this.addFrame(createTile({
                images: [image],
                size: { width: 1, height: 1 },
            }))
        }
    }
}
