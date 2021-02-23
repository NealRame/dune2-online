import clamp from "lodash/clamp"
import pad_start from "lodash/padStart"

function rgb2hsl(r, g, b) {
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h, s, l = (max + min)/2

    if (max === min) {
        h = s = 0
    } else {
        const d = max - min
        s = l > 0.5 ? d/(2 - max - min) : d/(max + min)
        switch(max) {
        case r:
            h = (g - b)/d + (g < b ? 6 : 0)
            break
        case g:
            h = (b - r)/d + 2
            break
        case b:
            h = (r - g)/d + 4
            break
        }
        h = h/6
    }
    return [h, s, l]
}

function hue2rgb(p, q, t) {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1/6) return p + 6*t*(q - p)
    if (t < 1/2) return q
    if (t < 2/3) return p + 6*(q - p)*(2/3 - t)
    return p
}

function hsl2rgb(h, s, l) {
    if (s === 0) {
        return [l, l, l] // achromatic
    }
    const q = l < 0.5 ? l*(1 + s) : l + s - l*s
    const p = 2*l - q
    return [
        hue2rgb(p, q, h + 1/3), // r
        hue2rgb(p, q, h),       // g
        hue2rgb(p, q, h - 1/3)  // b
    ]
}

function toByte(v) {
    return Math.round(v*255)
}

function toHex(v) {
    return pad_start(toByte(v).toString(16), 2, "0")
}

export default function Color(r, g, b, a = 1) {
    return {
        get red()   { return r },
        get red255()   { return toByte(r) },
        get green() { return g },
        get green255() { return toByte(g) },
        get blue()  { return b },
        get blue255()  { return toByte(b) },
        get alpha() { return a },
        get alpha255() { return toByte(a) },
        get rgb() { return [r, g, b] },
        get rgba() { return [r, g, b, a] },
        get rgb255() { return [r, g, b].map(toByte) },
        get rgba255() { return [r, g, b, a].map(toByte) },
        get hex() {
            return `#${[r, g, b].map(toHex).join("")}`
        },
        get cssrgb() {
            return `rgb(${[r, g, b].map(toByte).join(",")})`
        },
        get csshsl() {
            const [h, s, l] = rgb2hsl(r, g, b)
            return `hsl(${h},${s}%,${l}%,${a})`
        },
        get cssrgba() {
            return `rgb(${[r, g, b].map(toByte).join(",")},${a})`
        },
        get csshsla() {
            const [h, s, l] = rgb2hsl(r, g, b)
            return `hsla(${h},${s}%,${l}%,${a})`
        },
        darken(amount) {
            const [h, s, l] = rgb2hsl(r, g, b)
            return Color(...hsl2rgb(h, s, clamp(l - amount/100, 0, 1)), a)
        },
        lighten(amount) {
            const [h, s, l] = rgb2hsl(r, g, b)
            return Color(...hsl2rgb(h, s, clamp(l + amount/100, 0, 1)), a)
        }
    }
}

Color.hsl = function hsl(h, s, l) {
    return Color(...hsl2rgb(
        (h%360)/360,
        clamp(s, 0, 100)/100,
        clamp(l, 0, 100)/100
    ), 1)
}

Color.hsla = function hsla(h, s, l, a) {
    return Color(...hsl2rgb(
        (h%360)/360,
        clamp(s, 0, 100)/100,
        clamp(l, 0, 100)/100
    ), a)
}

Color.rgb = function rgb(r, g, b) {
    return Color(
        clamp(r, 0, 1),
        clamp(g, 0, 1),
        clamp(b, 0, 1),
        1
    )
}

Color.rgba = function rgba(r, g, b, a) {
    return Color(
        clamp(r, 0, 1),
        clamp(g, 0, 1),
        clamp(b, 0, 1),
        clamp(a, 0, 1),
    )
}