import Content from './content.vue'
import { createVNode, render } from 'vue'
import { selectImage } from 'vue-select-avatar'

export const selectAvatar = () => {
  return new Promise<File>(async (resolve, reject) => {
    let isConfirm = false
    let file: File | undefined

    const res = await selectImage({
      maxFileSize: 20 * 1024 * 1024,
      // 其他配置...
    })

    const el = document.createElement('div')

    const vnode = createVNode(Content, {
      info: res,
      onConfirm: (_file: File) => {
        file = _file
        isConfirm = true
      },
      onClose: () => {
        render(null, el)
        el.remove()
        if (isConfirm) {
          resolve(file!)
        } else {
          // 关闭时如果没有确认行为，同一视为取消
          reject(new Error('CANCEL'))
        }
      },
    })

    render(vnode, el)

    document.body.appendChild(el)
  })
}
