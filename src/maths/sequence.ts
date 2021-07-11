import { linspace } from "@/maths/linspace"
import { EasingFunction } from "@/maths/easing"

export function * sequence(count: number, easing: EasingFunction)
    : Generator<number> {
    for (const t of linspace(count)) {
        yield easing(t)
    }
}
