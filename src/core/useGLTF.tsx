import type { Accessor } from 'solid-js'
import { useLoader } from 'solid-three'
import { Loader } from 'three'
// import { useLoader } from 'solid-three'
import { DRACOLoader, GLTFLoader, MeshoptDecoder } from 'three-stdlib'

// type Loader<TSource = any, TResult = any, TReturnValue = any> = {
//   load: (
//     url: TSource,
//     onLoad: (result: TResult) => void,
//     onProgress: (() => void) | undefined,
//     onReject: ((error: ErrorEvent | unknown) => void) | undefined,
//   ) => TReturnValue
// }
// type LoaderUrl<T extends Loader> = Parameters<T['load']>[0]
// type LoaderResult<T extends Loader> = Parameters<Parameters<T['load']>[1]>[0]

// /**
//  * Hook to create and manage a resource using a Three.js loader. It ensures that the loader is
//  * reused if it has been instantiated before, and manages the resource lifecycle automatically.
//  *
//  * @template TResult The type of the resolved data when the loader completes loading.
//  * @template TArg The argument type expected by the loader function.
//  * @param Constructor - The loader class constructor.
//  * @param args - The arguments to be passed to the loader function, wrapped in an accessor to enable reactivity.
//  * @returns An accessor containing the loaded resource, re-evaluating when inputs change.
//  */

// export function useLoader<
//   const TLoader extends Loader,
//   const TArgs extends LoaderUrl<TLoader> | Array<LoaderUrl<TLoader>>,
// >(
//   Constructor: new (...args: any[]) => TLoader,
//   args: Accessor<TArgs>,
//   setup?: (loader: NoInfer<TLoader>) => void,
// ): TArgs extends LoaderUrl<TLoader>
//   ? Resource<LoaderResult<TLoader>>
//   : Resource<{ [K in keyof TArgs]: LoaderResult<TLoader> }> {
//   return null!
// }

let dracoLoader: DRACOLoader | null = null

function extensions(
  useDraco: boolean | string,
  useMeshopt: boolean,
  extendLoader?: (loader: GLTFLoader) => void,
) {
  return (loader: Loader) => {
    if (extendLoader) {
      extendLoader(loader as GLTFLoader)
    }
    if (useDraco) {
      if (!dracoLoader) {
        dracoLoader = new DRACOLoader()
      }
      dracoLoader.setDecoderPath(
        typeof useDraco === 'string'
          ? useDraco
          : 'https://www.gstatic.com/draco/versioned/decoders/1.5.5/',
      )
      ;(loader as GLTFLoader).setDRACOLoader(dracoLoader)
    }
    if (useMeshopt) {
      ;(loader as GLTFLoader).setMeshoptDecoder(
        typeof MeshoptDecoder === 'function' ? MeshoptDecoder() : MeshoptDecoder,
      )
    }
  }
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
 *       <T.Primitive object={model()} />
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
export function useGLTF<T extends string | string[]>(
  path: Accessor<T>,
  useDraco: boolean | string = true,
  useMeshOpt: boolean = true,
  extendLoader?: (loader: GLTFLoader) => void,
) {
  return useLoader(GLTFLoader, path, extensions(useDraco, useMeshOpt, extendLoader))
}
