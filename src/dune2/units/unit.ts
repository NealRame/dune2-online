import { sequence, Easing, RectangularCoordinates, Vector } from "@/maths"
import { Direction, Scene, Sprite } from "@/engine"
import { isNil } from "lodash"

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

function move(position: Vector, direction: Vector, frameCount: number) {
    return sequence(frameCount, t => {
        const v = Easing.Quadratic.easeInOut(t)
        return position.copy().add({
            x: v*direction.x,
            y: v*direction.y,
        })
    })
}

export class Unit extends Sprite {
    protected hitPoints_: number
    private destination_: Iterator<Vector> | null

    constructor(scene: Scene, position: RectangularCoordinates) {
        super(scene, position)
        this.hitPoints_ = 1
        this.destination_ = null
    }

    move(d: Direction): Unit {
        if (isNil(this.destination_)) {
            this.destination_ = move(this.position, direction(d), 60)
        }
        return this
    }

    update(): Unit {
        if (!isNil(this.destination_)) {
            const it = this.destination_.next()
            if (it.done) {
                this.destination_ = null
            } else {
                this.position = it.value
            }
        }
        return this
    }
}
