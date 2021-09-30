import { imageSet } from "@/dune2/data"
import { Sprite, IScene, Tile, Unit } from "@/engine"
import { IVector2D } from "@/maths"

export class Trike extends Unit {
    SpriteClass = class extends Sprite {
        protected getFrames_ = (scene: IScene): Array<Tile> => {
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
        }
    }

    constructor(scene: IScene, position: IVector2D) {
        super(scene, {
            health: 1.0,
            speed: 1.5,
        })
        this.x_ = position.x
        this.y_ = position.y
    }
}
