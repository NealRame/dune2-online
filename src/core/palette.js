import Color from "../graphics/color"

export function loadPalette(game_data) {
    const game_data_palette = game_data.getPalettesMap().get("Bene")
    return Promise.resolve(
        game_data_palette.getColorsList().map(game_data_color => Color.rgb(
            game_data_color.getRed(),
            game_data_color.getGreen(),
            game_data_color.getBlue(),
        ))
    )
}