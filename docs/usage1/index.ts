import Content from './content.vue'
import { createVNode, render } from 'vue'
import { selectImage } from 'vue-select-avatar'

export const selectAvatar = () => {
  return new Promise<File>(async (resolve, reject) => {
    let isCancel = false
    let isConfirm = false
    let file: File | undefined

    const res = await selectImage({ maxFileSize: 20 * 1024 * 1024 })

    const el = document.createElement('div')

    const vnode = createVNode(Content, {
      info: res,
      onCancel: () => {
        isCancel = true
      },
      onConfirm: (_file: File) => {
        file = _file
        isConfirm = true
      },
      onDestroy: () => {
        render(null, el)
        el.remove()
        if (isConfirm) {
          resolve(file!)
        } else {
          reject(isCancel ? new Error('CANCEL') : new Error('UNKNOWN'))
        }
      },
    })

    render(vnode, el)

    document.body.appendChild(el)
  })
}
