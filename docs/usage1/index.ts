import { selectImage, SelectAvatarError } from 'vue-select-avatar'

import Content from './content.vue'
import { createVNode, render } from 'vue'

export const selectAvatar = async () => {
  const res = await selectImage({
    maxFileSize: 20 * 1024 * 1024,
    // 其他配置...
  })

  return new Promise<File>((resolve, reject) => {
    let isConfirm = false
    let file: File | undefined
    let error: Error | undefined

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
          reject(error || new SelectAvatarError('CANCEL'))
        }
      },
      onError(err: Error) {
        error = err
      },
    })

    render(vnode, el)

    document.body.appendChild(el)
  })
}
