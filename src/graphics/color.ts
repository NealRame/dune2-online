import { clamp, padStart } from "lodash"

export type RGB = [number, number, number]
export type RGBA = [number, number, number, number]

function rgb2hsl(
    r: number,
    g: number,
    b: number,
): [number, number, number] {
    [r, g, b] = [r, g, b].map(c => c/255)

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const l = (max + min)/2

    let h: number
    let s: number

    if (max === min) {
        h = s = 0
    } else {
        const d = max - min
        s = l > 0.5 ? d/(2 - max - min) : d/(max + min)
        if (max === r) {
            h = (g - b)/d + (g < b ? 6 : 0)
        } else if (max === b) {
            h = (b - r)/d + 2
        } else {
            h = (r - g)/d + 4
        }
        h = h/6
    }

    return [
        clamp(h*360, 0, 360),
        clamp(s*100, 0, 100),
        clamp(l*100, 0, 100),
    ].map(Math.round) as [number, number, number]
}

function hue2rgb(
    p: number,
    q: number,
    t: number
) {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1/6) return p + 6*t*(q - p)
    if (t < 1/2) return q
    if (t < 2/3) return p + 6*(q - p)*(2/3 - t)
    return p
}

function hsl2rgb(
    h: number,
    s: number,
    l: number
): [number, number, number] {
    [h, s, l] = [h = h/360, s = s/100, l = l/100]

    if (s === 0) {
        return [l, l, l] // achromatic
    }

    const q = l < 0.5 ? l*(1 + s) : l + s - l*s
    const p = 2*l - q

    return [
        /* red   */ hue2rgb(p, q, h + 1/3),
        /* green */ hue2rgb(p, q, h),
        /* blue  */ hue2rgb(p, q, h - 1/3),
    ].map(c => Math.round(255*c)) as [number, number, number]
}

function toHex(v: number) {
    return padStart(v.toString(16), 2, "0")
}

/**
 * Create a RGB color
 * @param r red
 * @param g green
 * @param b blue
 * @returns a RGBA color
 */
export function rgb(
    r: number,
    g: number,
    b: number,
): RGBA {
    return [
        clamp(r, 0, 255),
        clamp(g, 0, 255),
        clamp(b, 0, 255),
        255,
    ]
}

/**
 * Create a HSL color
 * @param h hue
 * @param s saturation
 * @param l lightness
 * @returns a RGBA color
 */
export function rgba(
    r: number,
    g: number,
    b: number,
    a: number,
): RGBA {
    return [
        clamp(r, 0, 255),
        clamp(g, 0, 255),
        clamp(b, 0, 255),
        clamp(a, 0, 255),
    ]
}

/**
 * Create a HSLa color
 * @param h hue
 * @param s saturation
 * @param l lightness
 * @param a alpha
 * @returns a RGBA color
 */
export function hsla(
    h: number,
    s: number,
    l: number,
    a: number,
): RGBA {
    return [
        ...hsl2rgb(
            clamp(h, 0, 360),
            clamp(s, 0, 100),
            clamp(l, 0, 100),
        ),
        clamp(a, 0, 255)
    ]
}

/**
 * @param color
 * @returns the red channel value of the color
 */
export function red(color: RGB|RGBA): number {
    return color[0]
}

/**
 * @param color
 * @returns the green channel value of the color
 */
export function green(color: RGB|RGBA): number {
    return color[1]
}

/**
 * @param color
 * @returns the blue channel value of the color
 */
export function blue(color: RGB|RGBA): number {
    return color[2]
}

/**
 * @param color
 * @returns the alpha channel value of the color
 */
export function alpha(color: RGB|RGBA): number {
    return color.length === 4 ? color[3] : 255
}

/**
 * Convert color to css #rrggbb string
 * @param {Color}
 */
export function cssHex(color: RGB|RGBA): string {
    const [r, g, b] = color
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

/**
 * Convert color to css #rrggbb string
 * @param {Color}
 */
export function cssRGB(color: RGB|RGBA): string {
    const [r, g, b] = color
    return `rgb(${r}, ${g}, ${b})`
}

export function cssHSL(color: RGB|RGBA): string {
    const [r, g, b] = color
    const [h, s, l] = rgb2hsl(r, g, b)
    return `hsl(${h},${s}%,${l}%)`
}

export function cssRGBA(color: RGB|RGBA): string {
    const [r, g, b, a = 255] = color
    return `rgba(${r},${g},${b},${a/255})`
}

export function cssHSLA(color: RGB|RGBA): string {
    const [r, g, b, a = 255] = color
    const [h, s, l] = rgb2hsl(r, g, b)
    return `hsl(${h},${s}%,${l}%,${a/255})`
}

export function darken(color: RGB|RGBA, amount: number): RGBA {
    const [r, g, b, a = 255] = color
    const [h, s, l] = rgb2hsl(r, g, b)
    return hsla(h, s, l - amount, a)
}

export function lighten(color: RGB|RGBA, amount: number): RGBA {
    const [r, g, b, a = 255] = color
    const [h, s, l] = rgb2hsl(r, g, b)
    return hsla(h, s, l + amount, a)
}
