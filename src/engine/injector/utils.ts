import "reflect-metadata"

import {
    ServiceDefaultKey,
    ServiceInjectKey,
    ServiceMetadataKey,
} from "./constants"

import {
    ServiceInjectionParametersMap,
    ServiceDefaultParametersMap,
    ServiceMetadata,
    TConstructor,
} from "./types"

export function getServiceParametersMetadata(service: TConstructor)
    : Array<unknown> {
    return Reflect.getMetadata("design:paramtypes", service) ?? []
}

export function getServiceMetadata(service: TConstructor)
    : ServiceMetadata | undefined {
    return Reflect.getMetadata(ServiceMetadataKey, service)
}

export function getServiceInjectionParameterMap(service: TConstructor)
    : ServiceInjectionParametersMap {
    if (!Reflect.hasMetadata(ServiceInjectKey, service)) {
        Reflect.defineMetadata(ServiceInjectKey, new Map(), service)
    }
    return Reflect.getMetadata(ServiceInjectKey, service)
}

export function getServiceDefaultParameterMap(service: TConstructor)
    : ServiceDefaultParametersMap {
    if (!Reflect.hasMetadata(ServiceDefaultKey, service)) {
        Reflect.defineMetadata(ServiceDefaultKey, new Map(), service)
    }
    return Reflect.getMetadata(ServiceDefaultKey, service)
}
