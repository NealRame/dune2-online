<style lang="scss" scoped>
.homepage-content {
    position: absolute;
    top: 50%;
    left: 50%;

    margin: 0 auto;
    padding: 0;

    transform: translate(-50%, -50%);

    & > h1 {
        border-bottom: 1px solid $fg-color;

        color: $fg-color;

        font-family: "dune-rise";
        font-size: 6rem;
        font-weight: 100;

        margin: 0 0 2rem;
        padding: 0 0 .5rem;

        text-align: center;
    }

    & > ul {
        margin: 0 auto;
        padding: 0;

        list-style: none;

        & > li > a {
            border: 1px solid transparent;
            display: block;
            height: 100%;

            text-transform: uppercase;

            &:hover {
                background-color: darken($color: $link-color, $amount: 45%);
                border: 1px solid darken($color: $link-color, $amount: 35%);
            }
        }
    }
}
</style>

<template>
    <div class="homepage-content">
        <h1>Dune</h1>
        <ul class="game-menu">
            <li><router-link to="/game">Game</router-link></li>
            <li><router-link to="/editor">Editor</router-link></li>
        </ul>
    </div>
</template>
