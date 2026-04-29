import { createMemo, type Accessor } from 'solid-js'
import { CubeTextureLoader } from 'three'

export type Options = {
  path?: string
}

const loader = new CubeTextureLoader()
export function useCubeTexture<const T extends string[] | string[][]>(
  files: Accessor<T>,
  options?: Options,
) {
  return createMemo(async () => {
    const _files = files()
    if (options?.path) {
      loader.setPath(options.path)
    }
    if (Array.isArray(_files[0])) {
      return Promise.all(
        (_files as string[][]).map(
          file =>
            new Promise((resolve, reject) => {
              loader.load(file, resolve, undefined, reject)
            }),
        ),
      )
    }
    return new Promise((resolve, reject) => {
      loader.load(_files as string[], resolve, undefined, reject)
    })
  })
}
