<template>
    <q-input 
    ref="inputRef"  
    outlined
    dense
    debounce="300"
    clearable
    standout
    v-model="inputValue" 
    v-bind="$attrs"
    >
        <template v-if="showSearch" v-slot:append>
            <q-icon name="search" />
        </template>
    </q-input>
</template>
<script setup>
    import { ref, computed } from 'vue'

    const emits = defineEmits(['update:value'])
    const props = defineProps({
        value: {
            required: true
        },
        name: {
            type: String,
            required: true
        },
        label: {
            type: String,
            required: true
        },
        showSearch: {
            type: Boolean,
            required: false,
            default: true
        }
    })

    const inputValue = computed({
        get: () => props.value,
        set: (value) => emits('update:value', value)
    })
    const inputRef = ref(null)
    
    defineOptions({
        name: 'ItemInput',
        inheritAttrs: false
    })
</script>