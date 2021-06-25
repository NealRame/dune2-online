import { RectangularCoordinates, Vector } from "@/maths"
import { Scene, Sprite } from "@/engine"
import { clamp, isNil } from "lodash"

export class Unit extends Sprite {
    protected hitPoints_: number
    protected speedMax_: number
    protected direction_: Vector | null
    protected destination_: Vector | null

    constructor(scene: Scene, position: RectangularCoordinates) {
        super(scene, position)
        this.hitPoints_ = 1
        this.speedMax_ = 0.05
        this.direction_ = null
        this.destination_ = null
    }

    move({ x, y }: RectangularCoordinates): Unit {
        this.direction_ = (new Vector(x, y)).toUnit()
        this.destination_ = this.position.add(this.direction_)
        return this
    }

    update(): Unit {
        if (!isNil(this.destination_)) {
            const d = this.position.distance(this.destination_)
            if (d > 0.001) {
                const s = clamp(4*(d - d*d)*this.speedMax_, d === 1 ? 0.005 : 0, 1)
                this.position = (this.direction_?.copy() ?? Vector.Null()).mul(s).add({
                    x: this.x,
                    y: this.y,
                })
            } else {
                this.position = this.destination_
                this.destination_ = null
            }
        }
        return this
    }
}
