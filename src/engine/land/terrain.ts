import { ILand, Neighborhood, ITerrain } from "./types"

import { Image } from "@/engine"
import { Color } from "@/graphics"
import { IVector2D } from "@/maths"

export abstract class AbstractTerrain implements ITerrain {
    protected position_: IVector2D
    private land_: ILand<this>
    private revealed_ = false

    constructor(land: ILand, position: IVector2D) {
        this.land_ = land as ILand<this>
        this.position_ = position
        this.revealed_ = !land.fogOfWar
    }

    get x(): number {
        return this.position_.x
    }

    get y(): number {
        return this.position_.y
    }

    get position(): IVector2D {
        return this.position_
    }

    get revealed(): boolean {
        return this.revealed_
    }

    get neighbors(): Neighborhood<this> {
        const { x, y } = this.position_
        return [
            this.land_.terrain({ x, y: y - 1 }),
            this.land_.terrain({ x: x + 1, y }),
            this.land_.terrain({ x, y: y + 1 }),
            this.land_.terrain({ x: x - 1, y }),
        ]
    }

    abstract get color(): Color.RGBA
    abstract image(): Image[]

    reveal(): ITerrain {
        if (!this.revealed) {
            this.revealed_ = true
            this.update()
        }
        return this
    }

    update(): ITerrain {
        this.land_.updateTerrain(this)
        return this
    }
}
