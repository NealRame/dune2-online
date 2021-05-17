import { Vector } from "../../src/maths"

import { expect } from "chai"

describe("Vector", () => {
    describe("constructor", () => {
        it("construct a new Vector with the given coordinates", () => {
            const x = 3410
            const y = 8186
            const v = new Vector(x, y)
            expect(v.x).to.equals(x)
            expect(v.y).to.equals(y)
        })
    })
})
