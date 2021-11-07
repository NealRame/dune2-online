import { IUnit, IUnitData, IUnitEvent } from "./types"

import {
    Animation,
    createSequenceAnimation,
    createTransitionAnimation,
} from "@/engine/animation"
import { Entity } from "@/engine/entity"
import { IScene, ISceneItem } from "@/engine/scene"

import {
    Direction,
    DirectionCount,
    Easing,
    Vector
} from "@/maths"

import { clamp, isNil, times } from "lodash"
import { createObservable, IEmitter, IObservable } from "@/utils"

function directionRotationSequence(from: Direction, to: Direction) {
    const d = (from <= to ? to : to + DirectionCount) - from
    const step = d > 4 ? -1 : 1
    return times(Math.abs(d > 4 ? d - DirectionCount : d), () => {
        from = (from + step + DirectionCount)%DirectionCount
        return from
    })
}

export abstract class Unit<
    Data extends IUnitData = IUnitData,
    Events extends IUnitEvent<Data> = IUnitEvent<Data>
> extends Entity implements IUnit<Data> {
    private animation_: Animation|null = null

    protected emitter_: IEmitter<Events>
    protected events_: IObservable<Events>

    protected data_: Data

    protected x_ = 0
    protected y_ = 0
    protected direction_ = Direction.North

    constructor(scene: IScene, unitData: Data) {
        super()
        const [emitter, events] = createObservable<Events>()
        this.data_ = unitData
        this.emitter_ = emitter
        this.events_ = events
    }

    get data(): Data {
        return Object.assign({}, this.data_)
    }

    get events()
        : IObservable<Events> {
        return this.events_
    }

    get x(): number {
        return this.x_
    }

    get y(): number {
        return this.y_
    }

    get direction(): Direction {
        return this.direction_
    }

    abstract get view(): ISceneItem

    move(d: Direction): IUnit<Data> {
        const directions = directionRotationSequence(this.direction_, d)
        const direction = Vector.FromDirection(d)
        const { x, y } = this.position

        this.animation_ = createSequenceAnimation({
            animations: [
                createTransitionAnimation({
                    frames: Math.floor(30/this.data_.speed)*directions.length,
                    easing: Easing.step(directions.length),
                    set: t => {
                        const step = Math.floor(t*directions.length)
                        const direction = directions[clamp(step, 0, directions.length - 1)]
                        if (this.direction_ !== direction) {
                            this.direction_ = direction
                            this.emitter_.emit("directionChanged", this)
                        }
                    }
                }),
                createTransitionAnimation({
                    frames: Math.floor(60/this.data_.speed),
                    easing: Easing.Cubic.easeInOut,
                    set: t => {
                        this.x_ = x + t*direction.x
                        this.y_ = y + t*direction.y
                    }
                })
            ],
            done: () => this.emitter_.emit("destinationReached", this)
        })
        return this
    }

    set(data: Partial<Data>): IUnit<Data> {
        Object.assign(this.data_, data)
        this.emitter_.emit("changed", this)
        return this
    }

    update(): IUnit<Data> {
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
