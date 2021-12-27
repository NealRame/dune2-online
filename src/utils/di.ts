import "reflect-metadata"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Constructor<T = any> = { new (...args: any[]): T }

type DefaultMap = Map<number, unknown>

export enum Lifecycle {
    Singleton,
    Transient,
}

const ServiceLifecyclePropertyKey = Symbol("lifecycle")
const ServiceDefaultKey = Symbol("default")

export function Service(lifecycle: Lifecycle) {
    return Reflect.metadata(ServiceLifecyclePropertyKey, lifecycle)
}

function isService(type: Function): boolean {
    const lifecycle = Reflect.getMetadata(ServiceLifecyclePropertyKey, type)
    return lifecycle != null
}

function isPrimitive(type: Function): boolean {
    return type === Number || type === String || type === Boolean
}

export function Default<T>(value: T): ParameterDecorator {
    return (target, _, index) => {
        const defaultMap: DefaultMap = Reflect.getMetadata(ServiceDefaultKey, target) ?? new Map
        defaultMap.set(index, value)
        Reflect.defineMetadata(ServiceDefaultKey, defaultMap, target)
    }
}

export interface ILogger {
    log(message: string | null): void
}

export interface IUnit {
    x: number
    y: number
    move(x: number, y: number): IUnit
}

export class Container {
    private singletons_ = new WeakMap<Constructor, unknown>()

    private parameterInjector_(service: Constructor) {
        const defaultMap = Reflect.getMetadata(ServiceDefaultKey, service) as DefaultMap ?? new Map()
        return (paramType: Function, paramIndex: number) => {
            if (isService(paramType)) {
                return this.get(paramType as Constructor)
            } else if (isPrimitive(paramType)) {
                return defaultMap.has(paramIndex)
                    ? defaultMap.get(paramIndex)
                    : paramType()
            }
            throw new Error(`Failed to get requested service ${service.name}, cannot inject parameter=${paramIndex}`)
        }
    }

    private inject_<T>(service: Constructor<T>): T {
        const serviceParamsTypes = Reflect.getMetadata("design:paramtypes", service) ?? []
        const injectParameter = this.parameterInjector_(service)
        return Reflect.construct(
            service,
            serviceParamsTypes.map(injectParameter)
        )
    }

    has<T>(constructor: Constructor<T>): boolean {
        return isService(constructor)
    }

    get<T>(service: Constructor<T>): T {
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

// @Service(Lifecycle.Singleton)
// class Logger implements ILogger {
//     log(message: string | null) {
//         console.log(`LOG[${Date.now()}] ${message}`)
//     }
// }

// @Service(Lifecycle.Transient)
// class Unit implements IUnit {
//     constructor(
//         @Default(3.14) public x: number,
//         public y: number,
//         protected logger_: Logger,
//     ) { }

//     move(x: number, y: number): this {
//         this.logger_.log(`move to { x=${x}, y=${y} }`)
//         this.x = x
//         this.y = y
//         return this
//     }
// }

// console.log("build container")

// const container = new Container()

// console.log("build container - done")

// const logger = container.get(Logger)
// const unit = container.get(Unit)

// console.log(unit.x, unit.y)
// unit.move(2, 2)
