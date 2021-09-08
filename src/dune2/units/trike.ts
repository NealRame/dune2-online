import { imageSet } from "@/dune2/data"
import { Unit, IScene } from "@/engine"
import { IVector2D } from "@/maths"

export class Trike extends Unit {
    constructor(scene: IScene, position: IVector2D) {
        super(scene, position)

        const images = imageSet("units")
        const shape = { columns: 1, rows: 1 }

        this.speed_ = 1.5
        this.addFrame(shape, [images[8]] )
            .addFrame(shape, [images[9]] )
            .addFrame(shape, [images[11]])
            .addFrame(shape, [images[13]])
            .addFrame(shape, [images[15]])
            .addFrame(shape, [images[14]])
            .addFrame(shape, [images[12]])
            .addFrame(shape, [images[10]])
    }
}
