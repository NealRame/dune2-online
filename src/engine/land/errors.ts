export class LandConfigurationError extends Error {
    constructor(m: string) {
        super(m)
        Object.setPrototypeOf(this, LandConfigurationError.prototype)
    }
}

export class LandDataError extends Error {
    constructor(m: string) {
        super(m)
        Object.setPrototypeOf(this, LandDataError.prototype)
    }
}

export class LandDataSizeError extends Error {
    constructor(
        public current: number,
        public expected: number
    ) {
        super("Land data size error")
        Object.setPrototypeOf(this, LandDataSizeError.prototype)
    }
}
