import { clamp, isNil, times } from "lodash"

import {
    createSequenceAnimation,
    createTransitionAnimation,
    type Animation,
} from "@/engine/animation"

import {
    type IEntity,
} from "@/engine/entity"

import {
    type TConstructor,
} from "@/engine/injector"

import {
    Direction,
    DirectionCount,
    Easing,
    Vector,
} from "@/maths"

import {
    type IEntityData,
    type IEntityEvents,
    type IMovable,
    type IMovableData,
    type IMovableEvents,
} from "./types"

function directionRotationSequence(from: Direction, to: Direction) {
    const d = (from <= to ? to : to + DirectionCount) - from
    const step = d > 4 ? -1 : 1
    return times(Math.abs(d > 4 ? d - DirectionCount : d), () => {
        from = (from + step + DirectionCount)%DirectionCount
        return from
    })
}

export function Movable<
    Data extends IEntityData & IMovableData,
    Events extends IEntityEvents & IMovableEvents
>(Base: TConstructor<IEntity<Data, Events>>)
    : TConstructor<IEntity<Data, Events> & IMovable> {
    return class extends Base implements IMovable {
        private animation_: Animation|null = null

        move(d: Direction)
            : void {
            if (!isNil(this.animation_)) return

            const directions = directionRotationSequence(this.model.get("direction"), d)
            const direction = Vector.FromDirection(d)

            const x = this.x
            const y = this.y
            const speed = this.model.get("speed")

            const update = () => {
                if (!isNil(this.animation_)) {
                    this.animation_.next()
                }
            }

            this.events.on("update", update)

            this.animation_ = createSequenceAnimation({
                animations: [
                    createTransitionAnimation({
                        frames: Math.floor(30/speed)*directions.length,
                        easing: Easing.step(directions.length),
                        set: t => {
                            const step = Math.floor(t*directions.length)
                            const direction = directions[clamp(step, 0, directions.length - 1)]
                            if (this.model.get("direction") !== direction) {
                                this.model.set("direction", direction)
                            }
                        }
                    }),
                    createTransitionAnimation({
                        frames: Math.floor(60/speed),
                        easing: Easing.Cubic.easeInOut,
                        set: t => {
                            this.x = x + t*direction.x
                            this.y = y + t*direction.y
                        }
                    })
                ],
                done: () => {
                    this.events.off("update", update)
                    this.emitter.emit("destinationReached", this)
                }
            })
        }
    }
}
