import { Service, ServiceLifecycle } from "@/engine/injector"

export function LandGenerator(): ClassDecorator {
    const lifecycle = ServiceLifecycle.Singleton
    return Service({ lifecycle })
}

export function LandConfigurationProvider(): ClassDecorator {
    const lifecycle = ServiceLifecycle.Singleton
    return Service({ lifecycle })
}
