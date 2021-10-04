import { Easing, linspace } from "@/maths"

import { isNil, noop } from "lodash"

export interface Animation {
    finished: boolean,
    next(): void,
    reset(): void,
}

export interface AnimationConfig {
    readonly repeat?: boolean
    done?(): void
}

export interface AnimationTransitionConfig extends AnimationConfig {
    frames: number,                // the duration in number of frames of each step
    easing: Easing.EasingFunction, //
    set(t: number): void,          // the animation value callback
}

export function createTransitionAnimation(config: AnimationTransitionConfig): Animation {
    let it = linspace(config.frames)
    let t = it.next()

    const repeat = config.repeat ?? false
    const done = config.done ?? noop

    const finished = () => t?.done ?? false

    const reset = () => {
        it = linspace(config.frames)
        t = it.next()
    }

    const next = () => {
        if (!finished()) {
            config.set(config.easing(t.value))
            t = it.next()
            if (finished()) {
                if (repeat) {
                    reset()
                } else {
                    done()
                }
            }
        }
    }

    return {
        get finished() {
            return finished()
        },
        next,
        reset,
    }
}

export interface AnimationSequenceConfig extends AnimationConfig {
    animations: Animation[],
}

export function createSequenceAnimation(config: AnimationSequenceConfig): Animation {
    let currentIndex = 0

    const repeat = config.repeat ?? false
    const done = config.done ?? noop

    const current = () => {
        return config.animations[currentIndex]
    }

    const finished = (): boolean => {
        const animation = current()
        if (isNil(animation)) return true
        if (animation.finished) {
            currentIndex += 1
            return finished()
        }
        return false
    }

    const reset = () => {
        currentIndex = 0
        for (const animation of config.animations) {
            animation.reset()
        }
    }

    const next = () => {
        if (!finished()) {
            const animation = current()
            animation.next()
            if (finished()) {
                if (repeat) {
                    reset()
                } else {
                    done()
                }
            }
        }
    }

    return {
        get finished(): boolean {
            return finished()
        },
        next,
        reset,
    }
}
