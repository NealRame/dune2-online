import { makeNoise2D } from "open-simplex-noise"
import { RectangularCoordinates } from "./types"

export type Noise2DGeneratorConfig = {
    amplitude?: number,
    frequency?: number,
    octaves?: number,
    persistence?: number,
    scale?: number,
    seed?: number,
}
export type Noise2DFunction = (pos: RectangularCoordinates) => number

const noise2DGeneratorConfigDefaults = {
    scale: 1,
    amplitude: 1,
    frequency: 1,
    octaves: 1,
    persistence: 0.5,
}

export function createNoise2DGenerator(config: Noise2DGeneratorConfig = {}): Noise2DFunction {
    const noise = makeNoise2D(config.seed ?? Date.now())
    const {
        scale,
        amplitude,
        frequency,
        octaves,
        persistence,
    } = Object.assign({}, noise2DGeneratorConfigDefaults, config)
    return ({ x, y }): number => {
        x /= scale
        y /= scale
        let value = 0
        for (let octave = 0; octave < octaves; octave++) {
            x *= 2*frequency
            y *= 2*frequency
            value += noise(x, y)*(amplitude*Math.pow(persistence, octave))
        }
        return value/(2 - 1/Math.pow(2, octaves - 1))
    }
}
