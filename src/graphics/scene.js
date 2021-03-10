import {rgb} from "./color"

export default function Scene(painter) {
    const scene = {
        backgroundColor: rgb(0, 0, 0).cssrgb,
    }
    return {
        render() {
            painter.clear(scene.backgroundColor)
        }
    }
}