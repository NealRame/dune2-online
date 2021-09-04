import { Land, Neighborhood, Terrain } from "./types"

import { Image } from "@/engine"
import { Color } from "@/graphics"
import { RectangularCoordinates } from "@/maths"

export abstract class AbstractTerrain implements Terrain {
    protected position_: RectangularCoordinates
    private land_: Land<this>
    private revealed_ = false

    constructor(land: Land, position: RectangularCoordinates) {
        this.land_ = land as Land<this>
        this.position_ = position
        this.revealed_ = !land.fogOfWar
    }

    get x(): number {
        return this.position_.x
    }

    get y(): number {
        return this.position_.y
    }

    get position(): RectangularCoordinates {
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

    reveal(): Terrain {
        if (!this.revealed) {
            this.revealed_ = true
            this.update()
        }
        return this
    }

    update(): Terrain {
        this.land_.updateTerrain(this)
        return this
    }
}
