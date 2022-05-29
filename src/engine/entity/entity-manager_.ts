import {
    Container,
    Service,
    ServiceLifecycle,
} from "@/engine/injector"

export interface IEntityManager {
    reset(): IEntityManager
}

@Service({
    lifecycle: ServiceLifecycle.Singleton,
})
export class EntityManager {
    constructor(private container_: Container) {
    }

    reset(): this {
        return this
    }
}
