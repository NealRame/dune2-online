import { imageSet } from "@/dune2/data"

import { AnimationSprite, CompoundItem, IScene, ISceneItem, IUnitData, IUnitEvent, Sprite, Tile, Unit } from "@/engine"
import { Direction, IVector2D } from "@/maths"

import { isNil, memoize } from "lodash"

const harvesterFrames = memoize((scene: IScene) => {
    const images = imageSet("units")
    const size = { width: 1.5, height: 1.5 }
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

const harvesterSandPosition = memoize((direction: Direction) => {
    switch (direction) {
    case Direction.North:
        return { x:  0.25,   y:  0.6875 }

    case Direction.Northeast:
        return { x: -0.25,   y:  0.5625 }

    case Direction.East:
        return { x: -0.5625, y:  0.25   }

    case Direction.Southeast:
        return { x: -0.3125, y: -0.125  }

    case Direction.South:
        return { x:  0.25,   y: -0.3125 }

    case Direction.Southwest:
        return { x:  0.8125, y: -0.125  }

    case Direction.West:
        return { x:  1.0625, y:  0.25   }

    case Direction.Northwest:
        return { x:  0.75,   y:  0.5625 }
    }

    const exhaustiveCheck_: never = direction
    return exhaustiveCheck_
})

class HarvesterSprite extends Sprite {
    constructor(scene: IScene) {
        super(scene)
        this.frames_ = harvesterFrames(scene)
    }
}

class HarvesterSandSprite extends AnimationSprite {
    private position_: IVector2D
    protected repeat_ = true

    constructor(scene: IScene, direction: Direction) {
        super(scene)
        this.frames_ = harvesterSandFrames(scene)[direction]
        this.position_ = harvesterSandPosition(direction)
    }

    get x() { return this.position_.x }
    get y() { return this.position_.y }
}

export class HarvesterView extends CompoundItem {
    private harvesterSprite_: Sprite

    constructor(scene: IScene, harvester: Harvester) {
        super(scene, { width: 1.5, height: 1.5 })

        this.entity_ = harvester
        this.harvesterSprite_ = new HarvesterSprite(scene)

        this.pushItem(this.harvesterSprite_)

        harvester.events.listen("directionChanged", () => {
            this.harvesterSprite_.frameIndex = harvester.direction
            if (harvester.isHarvesting) {
                this.popItem()
                this.pushItem(new HarvesterSandSprite(scene, harvester.direction))
            }
        })
        harvester.events.listen("harvestStarted", () => {
            this.pushItem(new HarvesterSandSprite(scene, harvester.direction))
        })
        harvester.events.listen("harvestStopped", () => {
            this.popItem()
        })
    }
}

export interface IHarvesterData extends IUnitData {
    spice: number
}

export interface HarvesterEvents extends IUnitEvent<IHarvesterData> {
    harvestStarted: Harvester,
    harvestStopped: Harvester,
}

export class Harvester extends Unit<IHarvesterData, HarvesterEvents> {
    private view_: HarvesterView
    private harvesting_ = false

    constructor(scene: IScene, position: IVector2D) {
        super(scene, {
            health: 2.0,
            speed: 0.5,
            spice: 0.0,
        })
        this.x_ = position.x
        this.y_ = position.y
        this.view_ = new HarvesterView(scene, this)
    }

    get view():
        ISceneItem {
        return this.view_
    }

    get isHarvesting(): boolean {
        return this.harvesting_
    }

    harvestStart(): Harvester {
        if (!this.harvesting_) {
            this.harvesting_ = true
            this.events.emit("harvestStarted", this)
        }
        return this
    }

    harvestStop(): Harvester {
        if (this.harvesting_) {
            this.harvesting_ = false
            this.events.emit("harvestStopped", this)
        }
        return this
    }
}
