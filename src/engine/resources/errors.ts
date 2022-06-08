export class ResourceDefinitionError extends Error {
    constructor(m: string) {
        super(m)
        Object.setPrototypeOf(this, ResourceDefinitionError.prototype)
    }
}
