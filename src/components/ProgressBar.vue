<template>
    <div>
        <label>
            {{label}}
            <progress id="" :value="current" max=1></progress>
        </label>
    </div>
</template>

<style scoped>
</style>

<script>
export default {
    props: ["current", "label", "total"],
}
</script>
