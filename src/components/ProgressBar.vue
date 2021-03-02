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
    display: block;
    margin: 0 auto;
    width: 25%;
    label {
        color: $progress-bar-label-color;
        font-family: $progress-bar-label-font-family;
        font-size: $progress-bar-label-font-size;
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
