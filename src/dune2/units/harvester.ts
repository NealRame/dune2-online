import { imageSet } from "@/dune2/data"
import { Sprite, IScene, Tile, Unit } from "@/engine"
import { memoize } from "lodash"

const harvesterFrames = memoize((scene: IScene) => {
    const images = imageSet("units")
    const size = { width: 1, height: 1 }
    return [
        new Tile(scene, size, [images[16]]),
        new Tile(scene, size, [images[17]]),
        new Tile(scene, size, [images[19]]),
        new Tile(scene, size, [images[21]]),
        new Tile(scene, size, [images[23]]),
        new Tile(scene, size, [images[22]]),
        new Tile(scene, size, [images[20]]),
        new Tile(scene, size, [images[18]]),
    ]
})

export class HarvesterSprite extends Sprite {
    constructor(scene: IScene, unit: Unit) {
        super(scene)
        this.entity_ = unit
        this.frames_ = harvesterFrames(scene)
    }
}
