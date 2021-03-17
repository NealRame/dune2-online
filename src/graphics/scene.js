import {rgb} from "./color"

/**
 * @typedef {import("../graphics/painter").default} Painter
 * @typedef {import("../maths/rect").default} Rect
 */

function draw_grid(painter, {
    space = 16,
    color = "#222",
}) {
    const {width, height} = painter.size
    painter.pen = color
    // Draw vertical grid lines
    for (let x = .5; x < width; x += space) {
        painter.drawLine(
            {x, y: 0},
            {x, y: height}
        )
    }
    // Draw horizontal grid lines
    for (let y = .5; y < height; y += space) {
        painter.drawLine(
            {y, x: 0},
            {y, x: width}
        )
    }
}

/**
 * 
 * @param {Painter} painter
 * @returns {*}
 */
export default function Scene(painter) {
    const scene = {
        backgroundColor: rgb(0, 0, 0).cssrgb,
        grid: {
            enabled: true,
            space: 32
        }
    }
    return {
        render() {
            painter.clear(scene.backgroundColor)
            // draw grid
            if (scene.grid.enabled) {
                draw_grid(painter, scene.grid)
            }
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