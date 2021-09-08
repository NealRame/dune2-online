import { IVector2D } from "@/maths"
import { Sprite } from "../sprite"

export class Structure extends Sprite {
    protected hitPoints_: number
    protected powerUsage_: number
    protected buildingTime_: number
    protected buildingProgress_: number

    constructor(position: IVector2D) {
        super(position)
        this.buildingTime_ = 0
        this.buildingProgress_ = 1
        this.powerUsage_ = 0
        this.hitPoints_ = 1
    }
}
