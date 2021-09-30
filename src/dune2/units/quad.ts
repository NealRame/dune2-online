import { imageSet } from "@/dune2/data"
import { Sprite, IScene, Tile, Unit, ISceneItem, IEntity } from "@/engine"
import { IVector2D } from "@/maths"

class QuadSprite extends Sprite {
    private unit_: Unit

    constructor(scene: IScene, unit: Unit) {
        super(scene)

        const images = imageSet("units")
        const size = {
            width: 1,
            height: 1,
        }
        this.entity_ = unit as IEntity
        this.unit_ = unit
        this.frames_ = [
            new Tile(scene, size, [images[0]]),
            new Tile(scene, size, [images[1]]),
            new Tile(scene, size, [images[3]]),
            new Tile(scene, size, [images[5]]),
            new Tile(scene, size, [images[7]]),
            new Tile(scene, size, [images[6]]),
            new Tile(scene, size, [images[4]]),
            new Tile(scene, size, [images[2]]),
        ]
    }

    get frameIndex(): number {
        return this.unit_.direction
    }
}

export class Quad extends Unit {
    private view_: QuadSprite

    constructor(scene: IScene, position: IVector2D) {
        super(scene, {
            health: 1.0,
            speed: 1.0,
        })
        this.x_ = position.x
        this.y_ = position.y
        this.view_ = new QuadSprite(scene, this)
    }

    get view()
        : ISceneItem {
        return this.view_
    }
}
