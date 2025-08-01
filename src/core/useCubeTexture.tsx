import { Accessor } from 'solid-js'
import { useLoader } from 'solid-three'
import { CubeTextureLoader } from 'three'

type Options = {
  path: string
}

export function useCubeTexture<const T extends string[] | string[][]>(
  files: Accessor<T>,
  { path }: Options,
) {
  return useLoader(CubeTextureLoader, files, loader => loader.setPath(path))
}
