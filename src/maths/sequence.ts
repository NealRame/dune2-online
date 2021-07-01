import { linspace } from "@/maths/linspace"
import { EasingFunction } from "@/maths/easing"

export function * sequence<T>(count: number, easing: EasingFunction<T>)
    : Generator<ReturnType<EasingFunction<T>>> {
    for (const t of linspace(count)) {
        yield easing(t)
    }
}
