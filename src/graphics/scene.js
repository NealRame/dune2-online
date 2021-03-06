import Color from "@/graphics/color"

export default function Scene(painter) {
    const scene = {
        backgroundColor: Color.rgb(0, 0, 0).cssrgb,
    }
    return {
        render() {
            painter.clear(scene.backgroundColor)
        }
    }
}