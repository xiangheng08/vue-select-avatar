<script setup lang="ts">
import { Viewport, type ImageInfo } from 'vue-select-avatar'

import { ElDialog, ElButton } from 'element-plus'
import { ref, watchEffect } from 'vue'

interface Props {
  info: ImageInfo
}

defineProps<Props>()

const viewportRef = ref<InstanceType<typeof Viewport>>()
const visible = ref(true)

const emit = defineEmits(['close', 'confirm', 'error'])

const handleCancel = () => {
  visible.value = false
}

const handleConfirm = async () => {
  try {
    const file = await viewportRef.value?.crop<File>({
      format: 'file',
      // 裁剪配置...
    })
    emit('confirm', file)
    visible.value = false
  } catch (error) {
    emit('error', error)
    visible.value = false
  }
}

watchEffect(() => {
  if (!visible.value) {
    emit('close')
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
