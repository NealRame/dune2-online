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
    describe("#norm", () => {
        it("returns the magnitude of the vector", () => {
            const x = 3
            const y = 4
            const v = new Vector(x, y)
            expect(v.norm).to.equals(Math.sqrt(x*x + y*y))
        })
    })
    describe("#opposite", () => {
        it("returns opposite vector", () => {
            const x = 6276
            const y = 8636
            const v = new Vector(x, y)
            expect(v.opposite.x).to.equals(-x)
            expect(v.opposite.y).to.equals(-y)
        })
        it("does not mutate the vector", () => {
            const x = 1
            const y = 0
            const v1 = new Vector(x, y)
            const v2 = v1.opposite // eslint-disable-line @typescript-eslint/no-unused-vars
            expect(v1.x).to.equals(x)
            expect(v1.y).to.equals(y)
        })
    })
    describe("#add", () => {
        it("adds the vector like object to this vector", () => {
            const x1 = 7653
            const y1 = 1949
            const x2 = 6183
            const y2 = 5983
            const v = new Vector(x1, y1)
            v.add({ x: x2, y: y2 })
            expect(v.x).to.equals(x1 + x2)
            expect(v.y).to.equals(y1 + y2)
        })
        it("returns this vector", () => {
            const v = new Vector(7702, 3668)
            expect(v.add({ x: 4268, y: 7033 })).equals(v)
        })
    })
})
