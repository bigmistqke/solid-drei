import { defaultProps, resolve } from '@/utils'
import { createResource, type Accessor } from 'solid-js'
import { load } from 'solid-three'
import { DRACOLoader, GLTFLoader, MeshoptDecoder, type GLTF } from 'three-stdlib'

const loader = new GLTFLoader()
let dracoLoader: DRACOLoader | null = null

export interface UseGLTFOptions {
  useDraco?: boolean | string
  useMeshOpt?: boolean
  extendLoader?: (loader: GLTFLoader) => void
}

/**
 * Loads a GLTF model using `GLTFLoader`.
 *
 * This hook supports DRACO and Meshopt compression, and allows for custom loader extensions.
 *
 * @param path - An accessor function returning the path to the GLTF file. This can be a single string or an array of strings.
 * @param useDraco - A boolean or string to specify whether to use DRACO compression. If a string is provided, it is used as the path to the DRACO decoder. Default is true.
 * @param useMeshOpt - A boolean to specify whether to use Meshopt compression. Default is true.
 * @param extendLoader - An optional function to extend the GLTF loader with custom behavior.
 * @returns The loaded GLTF model(s).
 *
 * @example
 * // Using a single string
 * export default () => {
 *   const gltfPath = () => 'path/to/your/model.gltf';
 *   const model = useGLTF(gltfPath);
 *   return (
 *     <Suspense>
 *       <T.Entity from={model()} />
 *     </Suspense>
 *   );
 * }
 *
 * @example
 * // Using an array of strings
 * export default () => {
 *   const gltfPaths = () => ['path/to/your/model1.gltf', 'path/to/your/model2.gltf'];
 *   const models = useGLTF(gltfPaths);
 *   return (
 *     <Suspense>
 *       <For each={models()}>
 *         {(model, index) => (
 *           <T.Primitive key={index} object={model} />
 *         ))}
 *       </For>
 *     </Suspense>
 *   );
 * }
 *
 * @note This hook uses `createResource` under the hood, so you could use `<Suspense>` to handle loading states.
 *
 * @link https://threejs.org/docs/#examples/en/loaders/GLTFLoader
 */
export function useGLTF<T = GLTF>(path: Accessor<string>, options?: UseGLTFOptions) {
  const config = defaultProps(options, { useDraco: true, useMeshOpt: true })
  return createResource(path, path => {
    if (config.extendLoader) {
      config.extendLoader(loader as GLTFLoader)
    }
    if (config.useDraco) {
      dracoLoader ??= new DRACOLoader()
      dracoLoader.setDecoderPath(
        typeof config.useDraco === 'string'
          ? config.useDraco
          : 'https://www.gstatic.com/draco/versioned/decoders/1.5.5/',
      )
      loader.setDRACOLoader(dracoLoader)
    }
    if (config.useMeshOpt) {
      loader.setMeshoptDecoder(resolve(MeshoptDecoder))
    }
    return load(loader, path) as Promise<T>
  })[0]
}
