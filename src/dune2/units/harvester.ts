import { imageSet } from "@/dune2/data"
import { IScene, Unit } from "@/engine"
import { IVector2D } from "@/maths"

export class Harvester extends Unit {
    constructor(scene: IScene, position: IVector2D) {
        super(scene, position)

        const images = imageSet("units")
        const shape = { columns: 1, rows: 1 }

        this.speed_ = 0.5
        this.addFrame(shape, [images[16]])
            .addFrame(shape, [images[17]])
            .addFrame(shape, [images[19]])
            .addFrame(shape, [images[21]])
            .addFrame(shape, [images[23]])
            .addFrame(shape, [images[22]])
            .addFrame(shape, [images[20]])
            .addFrame(shape, [images[18]])
    }
}
