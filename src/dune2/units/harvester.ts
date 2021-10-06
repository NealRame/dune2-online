import { imageSet } from "@/dune2/data"

import { AnimationSprite, IScene, ISceneItem, SceneItem, Sprite, Tile, Unit } from "@/engine"
import { Painter } from "@/graphics"
import { Direction, Rect } from "@/maths"

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

const harvesterSandFrames = memoize((scene: IScene) => {
    const images = imageSet("units")
    const size = { width: 1, height: 1 }
    return {
        [Direction.North]: [
            new Tile(scene, size, [images[303]]),
            new Tile(scene, size, [images[304]]),
            new Tile(scene, size, [images[305]]),
        ],
        [Direction.Northeast]: [
            new Tile(scene, size, [images[306]]),
            new Tile(scene, size, [images[308]]),
            new Tile(scene, size, [images[310]]),
        ],
        [Direction.East]: [
            new Tile(scene, size, [images[312]]),
            new Tile(scene, size, [images[314]]),
            new Tile(scene, size, [images[316]]),
        ],
        [Direction.Southeast]: [
            new Tile(scene, size, [images[318]]),
            new Tile(scene, size, [images[320]]),
            new Tile(scene, size, [images[322]]),
        ],
        [Direction.South]: [
            new Tile(scene, size, [images[324]]),
            new Tile(scene, size, [images[325]]),
            new Tile(scene, size, [images[326]]),
        ],
        [Direction.Southwest]: [
            new Tile(scene, size, [images[319]]),
            new Tile(scene, size, [images[321]]),
            new Tile(scene, size, [images[323]]),
        ],
        [Direction.West]: [
            new Tile(scene, size, [images[313]]),
            new Tile(scene, size, [images[315]]),
            new Tile(scene, size, [images[317]]),
        ],
        [Direction.Northwest]: [
            new Tile(scene, size, [images[307]]),
            new Tile(scene, size, [images[309]]),
            new Tile(scene, size, [images[311]]),
        ]
    }
})

class HarvesterSprite extends Sprite {
    constructor(scene: IScene) {
        super(scene)
        this.frames_ = harvesterFrames(scene)
    }
}

class HarvesterSandSprite extends AnimationSprite {
    constructor(scene: IScene, direction: Direction) {
        super(scene)
        this.frames_ = harvesterSandFrames(scene)[direction]
    }
}

export class HarvesterView extends SceneItem {
    private harvesterSprite_: Sprite
    private sandSprite_: AnimationSprite

    constructor(scene: IScene, unit: Unit) {
        super(scene)

        this.entity_ = unit
        this.harvesterSprite_ = new HarvesterSprite(scene)
        this.sandSprite_ = new HarvesterSandSprite(scene, unit.direction)

        unit.events.listen("directionChanged", () => {
            this.harvesterSprite_.frameIndex = unit.direction
            this.sandSprite_ = new HarvesterSandSprite(scene, unit.direction)
        })
    }

    render(painter: Painter, viewport: Rect)
        : ISceneItem {
        const { gridSpacing } = this.scene

        painter.save()
        painter.translate(this.position.sub(viewport.topLeft()).mul(gridSpacing))
        this.harvesterSprite_.render(painter, this.harvesterSprite_.rect)
        painter.restore()

        return this
    }
}
