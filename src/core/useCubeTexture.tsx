import { createResource, type Accessor } from 'solid-js'
import { CubeTextureLoader } from 'three'

export type Options = {
  path?: string
}

const loader = new CubeTextureLoader()
export function useCubeTexture<const T extends string[] | string[][]>(
  files: Accessor<T>,
  options?: Options,
) {
  return createResource(files, files => {
    if (options?.path) {
      loader.setPath(options.path)
    }
    if (Array.isArray(files[0])) {
      return Promise.all(
        (files as string[][]).map(
          file =>
            new Promise((resolve, reject) => {
              loader.load(file, resolve, undefined, reject)
            }),
        ),
      )
    }
    return new Promise((resolve, reject) => {
      loader.load(files as string[], resolve, undefined, reject)
    })
  })
}
