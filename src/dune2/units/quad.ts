import { imageSet } from "@/dune2/data"
import { Sprite, IScene, Tile, Unit } from "@/engine"
import { memoize } from "lodash"

const quadFrames = memoize((scene: IScene) => {
    const images = imageSet("units")
    const size = {
        width: 1,
        height: 1,
    }
    return [
        new Tile(scene, size, [images[0]]),
        new Tile(scene, size, [images[1]]),
        new Tile(scene, size, [images[3]]),
        new Tile(scene, size, [images[5]]),
        new Tile(scene, size, [images[7]]),
        new Tile(scene, size, [images[6]]),
        new Tile(scene, size, [images[4]]),
        new Tile(scene, size, [images[2]]),
    ]
})

export class QuadSprite extends Sprite {
    constructor(scene: IScene, unit: Unit) {
        super(scene)
        this.entity_ = unit
        this.frames_ = quadFrames(scene)
    }
}
