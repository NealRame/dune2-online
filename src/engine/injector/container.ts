/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
import "reflect-metadata"

export interface TConstructor<T = any> {
    new(...args: Array<never>): T
}

type DefaultMap = Map<number, unknown>

export enum Lifecycle {
    Singleton,
    Transient,
}

const ServiceLifecyclePropertyKey = Symbol("service:lifecycle")
const ServiceDefaultKey = Symbol("service:default")
const ServiceInjectKey = Symbol("service:inject")

function isService(type: Function)
    : boolean {
    return Reflect.hasMetadata(ServiceLifecyclePropertyKey, type)
}

function isPrimitive(type: Function)
    : boolean {
    return type === Number
        || type === String
        || type === Boolean
}

function getDefaults(service: TConstructor)
    : DefaultMap {
    if (Reflect.hasMetadata(ServiceDefaultKey, service)) {
        return Reflect.getMetadata(ServiceDefaultKey, service)
    }
    return new Map()
}

export function Service(lifecycle: Lifecycle)
    : ClassDecorator {
    return Reflect.metadata(ServiceLifecyclePropertyKey, lifecycle)
}

export function Inject(token: string | symbol)
    : ParameterDecorator {
    return Reflect.metadata(ServiceInjectKey, token)
}

export function Default<T>(value: T)
    : ParameterDecorator {
    return (target, _, index) => {
        const defaults = (Reflect.hasMetadata(ServiceDefaultKey, target)
            ? Reflect.getMetadata(ServiceDefaultKey, target)
            : new Map()) as DefaultMap
        defaults.set(index, value)
        Reflect.defineMetadata(ServiceDefaultKey, defaults, target)
    }
}

export class Container {
    private singletons_ = new WeakMap<TConstructor, unknown>()

    private parameterInjector_(service: TConstructor) {
        const defaultMap = Reflect.getMetadata(ServiceDefaultKey, service) as DefaultMap ?? new Map()
        return (paramType: Function, paramIndex: number) => {
            if (isService(paramType)) {
                return this.get(paramType as TConstructor)
            } else if (isPrimitive(paramType)) {
                return defaultMap.has(paramIndex)
                    ? defaultMap.get(paramIndex)
                    : paramType()
            }
            throw new Error(`Failed to get requested service ${service.name}, cannot inject parameter=${paramIndex}`)
        }
    }

    private inject_<T>(service: TConstructor<T>): T {
        const serviceParamsTypes = Reflect.getMetadata("design:paramtypes", service) ?? []
        const injectParameter = this.parameterInjector_(service)
        return Reflect.construct(
            service,
            serviceParamsTypes.map(injectParameter)
        )
    }

    has<T>(constructor: TConstructor<T>): boolean {
        return isService(constructor)
    }

    get<T>(service: TConstructor<T>): T {
        const lifecycle = Reflect.getMetadata(ServiceLifecyclePropertyKey, service)
        if (lifecycle === Lifecycle.Singleton) {
            if (!this.singletons_.has(service)) {
                this.singletons_.set(service, this.inject_(service))
            }
            return this.singletons_.get(service) as T
        } else {
            return this.inject_(service)
        }
    }
}
