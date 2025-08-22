import { createResource, type Accessor } from 'solid-js'
import { load } from 'solid-three'
import { FBXLoader } from 'three-stdlib'

const loader = new FBXLoader()

/**
 * Loads an FBX model from a given path using `FBXLoader`.
 *
 * @param path - The path can be a single string or an array of strings, provided as an accessor function.
 * @returns The loaded FBX model(s).
 *
 * @note
 * This hook uses `createResource` under the hood, so you could use `<Suspense>` to handle loading states.
 *
 * @example
 * // Using a single string
 * export default () => {
 *   const fbxPath = () => 'path/to/your/model.fbx';
 *   const model = useFBX(fbxPath);
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
 *   const fbxPaths = () => ['path/to/your/model1.fbx', 'path/to/your/model2.fbx'];
 *   const models = useFBX(fbxPaths);
 *   return (
 *     <Suspense>
 *       <For each={models()}>
 *         {(model, index) => (
 *           <T.Primitive key={index} object={model} />
 *         )}
 *       </For>
 *     </Suspense>
 *   );
 * }
 *
 * @link https://threejs.org/docs/#examples/en/loaders/FBXLoader
 */
export function useFBX(path: Accessor<string>) {
  return createResource(path, path => load(loader, path))[0]
}
