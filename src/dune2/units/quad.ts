import { imageSet } from "@/dune2/data"
import { Unit, Scene } from "@/engine"
import { RectangularCoordinates } from "@/maths"

export class Quad extends Unit {
    constructor(scene: Scene, position: RectangularCoordinates) {
        super(scene, position)

        const images = imageSet("units")
        const shape = { columns: 1, rows: 1 }

        this.addFrame(shape, [images[0]])
            .addFrame(shape, [images[1]])
            .addFrame(shape, [images[3]])
            .addFrame(shape, [images[5]])
            .addFrame(shape, [images[7]])
            .addFrame(shape, [images[6]])
            .addFrame(shape, [images[4]])
            .addFrame(shape, [images[2]])
    }
}
