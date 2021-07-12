import { Easing, linspace } from "@/maths"

import { isNil } from "lodash"

export interface Animation {
    finished: boolean,
    next(): void,
}

export interface AnimationConfig {
    done?(): void
}

export interface AnimationTransitionConfig extends AnimationConfig {
    frames: number,                // the duration in number of frames of each step
    easing: Easing.EasingFunction, //
    set(t: number): void,          // the animation value callback
}

export function createTransitionAnimation(config: AnimationTransitionConfig): Animation {
    const it = linspace(config.frames)
    let t = it.next()
    const finished = () => t?.done ?? false
    return {
        get finished() {
            return finished()
        },
        next(): void {
            if (!finished()) {
                config.set(config.easing(t.value))
                t = it.next()
                if (finished() && !isNil(config.done)) {
                    config.done()
                }
            }
        }
    }
}

export interface AnimationSequenceConfig extends AnimationConfig {
    animations: Animation[],
}

export function createSequenceAnimation(config: AnimationSequenceConfig): Animation {
    let current = config.animations.shift()
    return {
        get finished(): boolean {
            return isNil(current)
        },
        next(): void {
            if (!isNil(current)) {
                current.next()
                if (current.finished) {
                    current = config.animations.shift()
                    if (isNil(current) && !isNil(config.done)) {
                        config.done()
                    }
                }
            }
        }
    }
}
