import { Loader } from 'three'
// @ts-ignore
import { useLoader } from '@solid-three/fiber'
import { DRACOLoader, GLTFLoader, MeshoptDecoder } from 'three-stdlib'

let dracoLoader: DRACOLoader | null = null

function extensions(useDraco: boolean | string, useMeshopt: boolean, extendLoader?: (loader: GLTFLoader) => void) {
  return (loader: Loader) => {
    if (extendLoader) {
      extendLoader(loader as GLTFLoader)
    }
    if (useDraco) {
      if (!dracoLoader) {
        dracoLoader = new DRACOLoader()
      }
      dracoLoader.setDecoderPath(
        typeof useDraco === 'string' ? useDraco : 'https://www.gstatic.com/draco/versioned/decoders/1.5.5/'
      )
      ;(loader as GLTFLoader).setDRACOLoader(dracoLoader)
    }
    if (useMeshopt) {
      ;(loader as GLTFLoader).setMeshoptDecoder(
        typeof MeshoptDecoder === 'function' ? MeshoptDecoder() : MeshoptDecoder
      )
    }
  }
}

export function useGLTF<T extends string | string[]>(
  path: T,
  useDraco: boolean | string = true,
  useMeshOpt: boolean = true,
  extendLoader?: (loader: GLTFLoader) => void
) {
  return useLoader(GLTFLoader, path, extensions(useDraco, useMeshOpt, extendLoader))
}

useGLTF.preload = (
  path: string | string[],
  useDraco: boolean | string = true,
  useMeshOpt: boolean = true,
  extendLoader?: (loader: GLTFLoader) => void
) => useLoader.preload(GLTFLoader, path, extensions(useDraco, useMeshOpt, extendLoader))

useGLTF.clear = (input: string | string[]) => useLoader.clear(GLTFLoader, input)
