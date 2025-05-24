export interface SelectFileOptions {
  accept?: string
  multiple?: boolean
}

/**
 * 选择文件
 * @example
 * selectFile({ accept: 'image/*', multiple: true }).then(files => {
 *     console.log(files)
 * })
 */
export const selectFile = (options: SelectFileOptions): Promise<File[]> => {
  return new Promise((resolve, reject) => {
    const { accept, multiple } = options || {}
    const input = document.createElement('input')
    input.type = 'file'
    if (accept) input.accept = accept
    if (multiple) input.multiple = multiple
    input.onchange = () => {
      const files = Array.from(input.files || [])
      if (files.length > 0) {
        resolve(files)
      } else {
        reject()
      }
    }
    input.onerror = () => reject()
    input.click()
  })
}
