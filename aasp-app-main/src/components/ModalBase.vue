<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits(['close'])
const props = defineProps({
    largura: String,
    altura: String,
    visible: Boolean,
})
const largura = props.largura || '100%'

const visible = ref(props.visible)
function close() {
    emit("close");
}
</script>

<template>
    <transition name="modal-fade ">

        <div v-show=visible class="modal-backdrop">

            <div class="modal"  role="dialog"  aria-labelledby="modalTitle" aria-describedby="modalDescription" >

                <div class="modal-dialog modal-dialog-scrollable col " :style="'max-height: '+props.altura+'; min-width:'+largura"    >
                    <div class="modal-content card h-100 py-2 " style="text-align: center; width:100%;">
                        <div class="modal-header card-body w-100 mx-auto text-center mb-0 mt-0" style="max-width: 23rem;">
                            <h3>
                                <slot name="header">Modal title</slot>
                            </h3>
                        </div>

                        <main class="modal-body pt-0 pb-0 my-0" id="modalDescription" >
                            <div class="modal-body fs-sm "  >
                                <slot name="body"> Default body content </slot>
                            </div>
                        </main>

                        <div class="modal-footer ">
                            <slot name="footer" > rodapé</slot>
                        </div>

                    </div>
                </div>
            </div>

        </div>
    </transition>
</template>

<style scoped>
    .modal-backdrop {
        position: fixed;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        background-color: rgba(0, 0, 0, 0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index:2000;
    }

    .modal {
        box-shadow: 1px 1px 5px 0px;
        overflow-x: auto;
        display: flex;
        flex-direction: column;
        z-index: 10002;
    }

    .modal-header
    .modal-footer {
        padding: 15px;
    }

    .modal-header{
        display: flex;
        justify-content: center;
        padding-bottom: 0px;
    }
</style>
