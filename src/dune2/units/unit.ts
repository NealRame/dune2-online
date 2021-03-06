import {
    Animation,
    createSequenceAnimation,
    createTransitionAnimation,
    Direction,
    DirectionCount,
    Scene,
    Sprite,
} from "@/engine"
import { Easing, RectangularCoordinates, Vector } from "@/maths"
import { createObserver, EventCallback, Observer } from "@/utils"

import { clamp, isNil, times } from "lodash"

function direction(d: Direction): Vector {
    switch (d) {
    case Direction.North:
        return Vector.Up()

    case Direction.Northeast:
        return Vector.UpRight()

    case Direction.East:
        return Vector.Right()

    case Direction.Southeast:
        return Vector.DownRight()

    case Direction.South:
        return Vector.Down()

    case Direction.Southwest:
        return Vector.DownLeft()

    case Direction.West:
        return Vector.Left()

    case Direction.Northwest:
        return Vector.UpLeft()
    }

    const exhaustiveCheck_: never = d
    return exhaustiveCheck_
}

function directionRotationSequence(from: Direction, to: Direction) {
    const d = (from <= to ? to : to + DirectionCount) - from
    const step = d > 4 ? -1 : 1
    return times(Math.abs(d > 4 ? d - DirectionCount : d), () => {
        from = (from + step + DirectionCount)%DirectionCount
        return from
    })
}

export class Unit extends Sprite {
    protected hitPoints_: number

    private moveObserver_: Observer<void>
    private animation_: Animation|null

    constructor(scene: Scene, position: RectangularCoordinates) {
        super(scene, position)
        this.hitPoints_ = 1
        this.animation_ = null
        this.moveObserver_ = createObserver()
    }

    get direction(): Direction {
        return this.frameIndex
    }

    set direction(direction: Direction) {
        this.frameIndex = direction
    }

    move(moveDirection: Direction): Unit {
        const directions = directionRotationSequence(this.direction, moveDirection)
        const p = this.position
        const d = direction(moveDirection)
        this.animation_ = createSequenceAnimation({
            animations: [
                createTransitionAnimation({
                    frames: 30*directions.length,
                    easing: Easing.step(directions.length),
                    set: (t: number) => {
                        this.direction = directions[clamp(Math.floor(t*directions.length), 0, directions.length - 1)]
                    }
                }),
                createTransitionAnimation({
                    frames: 60,
                    easing: Easing.Cubic.easeInOut,
                    set: (t: number) => {
                        this.position = p.copy().add({
                            x: t*d.x,
                            y: t*d.y,
                        })
                    }
                })
            ],
            done: () => this.moveObserver_.publish()
        })
        return this
    }

    onDestinationReached(listener: EventCallback<void>): () => void {
        return this.moveObserver_.subscribe(listener)
    }

    update(): Unit {
        if (!isNil(this.animation_)) {
            if (this.animation_.finished()) {
                this.animation_ = null
            } else {
                this.animation_.next()
            }
        }
        return this
    }
}
