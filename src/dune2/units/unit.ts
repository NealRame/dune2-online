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

function directionToVector(d: Direction): Vector {
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
    protected speed_: number

    private moveObserver_: Observer<void>
    private animation_: Animation|null

    constructor(scene: Scene, position: RectangularCoordinates) {
        super(scene, position)
        this.hitPoints_ = 1
        this.speed_ = 1
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
        const position = this.position
        const direction = directionToVector(moveDirection)
        this.animation_ = createSequenceAnimation({
            animations: [
                createTransitionAnimation({
                    frames: Math.floor(30/this.speed_)*directions.length,
                    easing: Easing.step(directions.length),
                    set: t => {
                        this.direction = directions[clamp(Math.floor(t*directions.length), 0, directions.length - 1)]
                    }
                }),
                createTransitionAnimation({
                    frames: Math.floor(60/this.speed_),
                    easing: Easing.Cubic.easeInOut,
                    set: t => {
                        this.position = position.copy().add({
                            x: t*direction.x,
                            y: t*direction.y,
                        })
                    }
                })
            ],
            done: this.moveObserver_.publish
        })
        return this
    }

    onDestinationReached(listener: EventCallback<void>): () => void {
        return this.moveObserver_.subscribe(listener)
    }

    update(): Unit {
        if (!isNil(this.animation_)) {
            if (this.animation_.finished) {
                this.animation_ = null
            } else {
                this.animation_.next()
            }
        }
        return this
    }
}