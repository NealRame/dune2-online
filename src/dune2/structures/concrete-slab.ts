import { Structure } from "./structure"

import { tiles } from "../data"
import { createTile } from "../tile"

import { IRectangularCoordinates } from "@/maths"

export class ConcreteSlab extends Structure {
    constructor(position: IRectangularCoordinates) {
        super(position)

        const tileDescriptors = tiles()

        this.addFrame(createTile(tileDescriptors[125]))
        this.addFrame(createTile(tileDescriptors[123]))
        this.addFrame(createTile(tileDescriptors[124]))
    }

    update(): ConcreteSlab {
        if (this.hitPoints_ === 0) {
            this.frameIndex = 2
        } else if (this.hitPoints_ < 0.5) {
            this.frameIndex = 1
        }
        return this
    }
}
