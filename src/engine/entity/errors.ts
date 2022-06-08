import {
    type Token,
} from "@/engine/injector"

export class EntityDefinitionError extends Error {
    constructor(id: Token) {
        super(`Entity definition error: ${id.toString}. Entity must be defined with Entity.define(...) function.`)
        Object.setPrototypeOf(this, EntityDefinitionError.prototype)
    }
}
