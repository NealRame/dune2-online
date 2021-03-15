<template>
    <div class="progress-bar">
        <label>
            <progress :value="current" max=1></progress>
            {{label}}
        </label>
    </div>
</template>

<style lang="scss" scoped>
.progress-bar {
    background-color: rgba(0, 0, 0, 1);
    position: absolute;
    display: block;
    width: 100%;
    height: 100%;
    z-index: 10;
    label {
        position: absolute;
        left: 10%;
        right: 10%;
        top: 50%;
        color: $progress-bar-label-color;
        font-family: $progress-bar-label-font-family;
        font-size: $progress-bar-label-font-size;
        text-align: center;
    }
    progress {
        display: block;
        border:
            $progress-bar-border-width
            $progress-bar-border-type
            $progress-bar-border-color;
        height: $progress-bar-height;
        width: 100%;
        padding: $progress-bar-padding;
        &::-webkit-progress-bar {
            background: transparent;
        }
        &::-webkit-progress-value {
            background: $progress-bar-color;
        }
        &::-moz-progress-bar {
            background: $progress-bar-color;
        }
    }
}

</style>

<script>
export default {
    props: ["current", "label"],
}
</script>
