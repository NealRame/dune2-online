import { Direction, DirectionCount, Scene, Sprite } from "@/engine"
import { linspace, Easing, RectangularCoordinates, Vector } from "@/maths"
import { createObserver, EventCallback, Observer } from "@/utils"

import { isNil, times } from "lodash"

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

function * createDirectionAnimation(from: Direction, to: Direction, frameCount: number) {
    const d = (from <= to ? to : to + DirectionCount) - from
    const step = d > 4 ? -1 : 1

    const directions = times(
        Math.abs(d > 4 ? d - DirectionCount : d),
        () => {
            from = (from + step + DirectionCount)%DirectionCount
            return from
        }
    )

    for (const direction of directions) {
        for (let frame = 0; frame < frameCount; ++frame) {
            yield direction
        }
    }
}

function * createMoveAnimation(position: Vector, direction: Vector, frameCount: number) {
    for (const t of linspace(frameCount)) {
        const v = Easing.Quadratic.easeInOut(t)
        yield position.copy().add({
            x: v*direction.x,
            y: v*direction.y,
        })
    }
}

export class Unit extends Sprite {
    protected hitPoints_: number
    private destination_: Iterator<Vector> | null
    private direction_: Iterator<Direction> | null

    private moveObserver_: Observer<void>

    constructor(scene: Scene, position: RectangularCoordinates) {
        super(scene, position)
        this.hitPoints_ = 1
        this.destination_ = null
        this.direction_ = null
        this.moveObserver_ = createObserver()
    }

    move(d: Direction): Unit {
        if (isNil(this.direction_)) {
            this.direction_ = createDirectionAnimation(this.frameIndex as Direction, d, 30)
        }
        if (isNil(this.destination_)) {
            this.destination_ = createMoveAnimation(this.position, direction(d), 60)
        }
        return this
    }

    onDestinationReached(listener: EventCallback<void>): () => void {
        return this.moveObserver_.subscribe(listener)
    }

    update(): Unit {
        if (!isNil(this.direction_)) {
            const it = this.direction_.next()
            if (it.done) {
                this.direction_ = null
            } else {
                this.frameIndex = it.value
            }
        } else if (!isNil(this.destination_)) {
            const it = this.destination_.next()
            if (it.done) {
                this.destination_ = null
                this.moveObserver_.publish()
            } else {
                this.position = it.value
            }
        }
        return this
    }
}
