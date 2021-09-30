import { imageSet } from "@/dune2/data"
import { Sprite, IScene, Tile, Unit } from "@/engine"
import { IVector2D } from "@/maths"

export class Harvester extends Unit {
    SpriteClass = class extends Sprite {
        protected getFrames_ = (scene: IScene): Array<Tile> => {
            const images = imageSet("units")
            const size = {
                width: 1.5,
                height: 1.5,
            }
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
        }
    }

    constructor(scene: IScene, position: IVector2D) {
        super(scene, {
            health: 1.0,
            speed: 0.5,
        })
        this.x_ = position.x
        this.y_ = position.y
    }
}
