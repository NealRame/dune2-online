/**
 * 
 * @param {Data} game_data 
 * @returns {Array<Array<number>>}
 */
export function loadPalette(game_data) {
    const game_data_palette = game_data.getPalettesMap().get("Bene")
    return game_data_palette
        .getColorsList()
        .map((game_data_color, index) => [
            Math.round(255*game_data_color.getRed()),
            Math.round(255*game_data_color.getGreen()),
            Math.round(255*game_data_color.getBlue()),
            index === 0 ? 0 : 255 // Color 0 is used for transparency
        ])
}