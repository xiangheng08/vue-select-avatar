<script setup lang="ts">
import 'vue-select-avatar/style.css'
import { Viewport, type ImageInfo } from 'vue-select-avatar'

import { ElDialog, ElButton } from 'element-plus'
import { ref, watchEffect } from 'vue'

interface Props {
  info: ImageInfo
}

defineProps<Props>()

const viewportRef = ref<InstanceType<typeof Viewport>>()
const visible = ref(true)

const emit = defineEmits(['destroy', 'cancel', 'confirm'])

const handleCancel = () => {
  emit('cancel')
  visible.value = false
}

const handleConfirm = async () => {
  const file = await viewportRef.value?.cropper()
  emit('confirm', file)
  visible.value = false
}

watchEffect(() => {
  if (!visible.value) {
    emit('destroy')
  }
})
</script>

<template>
  <el-dialog v-model="visible" title="选择图片" width="332" append-to-body>
    <Viewport grid :info="info" ref="viewportRef" />
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleConfirm">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>
