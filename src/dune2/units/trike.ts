import { imageSet } from "@/dune2/data"
import { Sprite, IScene, Tile, Unit } from "@/engine"
import { memoize } from "lodash"

const trikeFrames = memoize((scene: IScene) => {
    const images = imageSet("units")
    const size = {
        width: 1,
        height: 1,
    }
    return [
        new Tile(scene, size, [images[8]]),
        new Tile(scene, size, [images[9]]),
        new Tile(scene, size, [images[11]]),
        new Tile(scene, size, [images[13]]),
        new Tile(scene, size, [images[15]]),
        new Tile(scene, size, [images[14]]),
        new Tile(scene, size, [images[12]]),
        new Tile(scene, size, [images[10]]),
    ]
})

export class TrikeSprite extends Sprite {
    constructor(scene: IScene, unit: Unit) {
        super(scene)
        this.entity_ = unit
        this.frames_ = trikeFrames(scene)
    }
}
