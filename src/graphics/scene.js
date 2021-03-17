import {rgb} from "./color"

export default function Scene(painter) {
    const scene = {
        backgroundColor: rgb(0, 0, 0).cssrgb,
        gridEnabled: false,
        gridSpace: 16,
    }
    return {
        render() {
            const {width, height} = painter.size
            const x = width/2 - 100 + .5
            const y = height/2 - 100 + .5

            painter.clear(scene.backgroundColor)
            painter.pen = "white"
            painter.drawRect({x, y, width: 200, height: 200})
        },
        run() {
            const loop = () => {
                this.render()
                requestAnimationFrame(loop)
            }
            loop()
        }
    }
}