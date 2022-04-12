<script lang="ts">
import { computed, defineComponent } from "vue"

let inputRangeCount = 0

export default defineComponent({
    name: "InputRange",
    emits: ["update:modelValue"],
    props: {
        label: {
            type: String,
            default: "",
        },
        name: {
            type: String,
            default: () => `input-range-${++inputRangeCount}`,
        },
        range: {
            type: Array,
            default: () => [0, 1],
        },
        step: {
            type: Number,
            default: 0.01,
        },
        modelValue: Number,
    },
    setup(props, { emit, expose }) {
        expose({})
        return {
            onInput: (ev: Event) => {
                const input = ev.target as HTMLInputElement
                const value = parseFloat(input.value)
                if (!isNaN(value)) {
                    emit("update:modelValue", value)
                }
            },
            min: computed(() => props.range[0]),
            max: computed(() => props.range[1]),
        }
    },
})
</script>

<template>
    <label v-if="label" for="name">{{label}}</label>
    <input
        ref="input"
        type="range"
        :name="name"
        :max="max"
        :min="min"
        :step="step"
        :value="modelValue"
        @input="onInput"
    >
    <span>{{modelValue}}</span>
</template>
