import { awaitMapObject, isRecord, resolve } from '@/utils'
import type { AccessorMaybe } from '@/utils/types'
import { createResource, merge, type Resource } from 'solid-js'
import { type S3 } from 'solid-three'
import { type Loader } from 'three'
import { LoaderCache, type LoaderRegistry } from './LoaderCache'

/** Global cache of loader instances to prevent duplicates */
const LOADER_CACHE = new Map<
  S3.Constructor<Loader<object, string | string[]>>,
  Loader<object, string | string[]>
>()

/**********************************************************************************/
/*                                                                                */
/*                                      Types                                     */
/*                                                                                */
/**********************************************************************************/

/** Extract URL type from a Three.js loader */
type UrlFromLoader<TLoader extends Loader<any, any>> = TLoader extends Loader<any, infer U>
  ? U
  : never

/** Extract data type from a Three.js loader */
type DataFromLoader<TLoader extends Loader<any, any>> = TLoader extends Loader<infer U, any>
  ? U
  : never

/**
 * Configuration options for the useLoader hook.
 */
export interface UseLoaderOptions<T extends Loader<any, any>, TResult> {
  /** Base URL to resolve relative paths against */
  base?: string
  /**
   * Whether to use caching.
   * - `true` | `undefined`: Use the default global cache
   * - `LoaderRegistry`: Use a custom cache instance
   * - `false`: No caching
   */
  cache?: true | LoaderRegistry
  onBeforeLoad?(loader: T): void
  onLoad?(resource: TResult): void
}

/**********************************************************************************/
/*                                                                                */
/*                                      Utils                                     */
/*                                                                                */
/**********************************************************************************/

/**
 * Resolves URLs relative to a base URL, handling strings, arrays, and nested objects.
 * @param base The base URL to resolve against
 * @param url The URL(s) to resolve
 * @returns The resolved URL(s) in the same structure as the input
 * @internal
 */
function resolveUrls<T extends string | string[] | Record<string, string | string[]>>(
  base: string,
  url: T,
): T {
  if (Array.isArray(url)) {
    return url.map(url => new URL(url, base).href) as T
  } else if (typeof url === 'object') {
    return Object.fromEntries(
      Object.entries(url).map(([key, url]) => [key, resolveUrls(base, url)] as const),
    ) as T
  } else {
    return new URL(url, base).href as T
  }
}

/**
 * Gets a resource from cache or loads and caches it.
 * @param registry The cache registry to use
 * @param loader The Three.js loader instance
 * @param url The URL(s) to load
 * @returns Promise resolving to the loaded resource
 * @internal
 */
async function getOrInsertLoaderRegistry<T extends object>(
  registry: LoaderRegistry,
  loader: Loader<T, any>,
  url: string | string[] | Record<string, string | string[]>,
): Promise<T> {
  const cachedPromise = registry.get(loader, url, false)
  if (cachedPromise) {
    return cachedPromise
  }
  // Use the Three.js loader directly since solid-three's load() is typed for specific URL types
  const promise = new Promise<T>((resolve, reject) =>
    (loader as Loader<T, string>).load(url as string, resolve, undefined, reject),
  )
  registry.set(loader, url, promise)
  return promise
}

/**********************************************************************************/
/*                                                                                */
/*                                   Use Loader                                   */
/*                                                                                */
/**********************************************************************************/

/**
 * Hook for loading Three.js resources with caching.
 *
 * @template TLoader The Three.js loader type
 * @template TPaths Record type mapping keys to URLs
 * @param loader Three.js loader constructor
 * @param paths Record mapping keys to URLs to load (can be a value or accessor)
 * @param options Configuration options
 * @returns Solid.js resource containing the loaded data mapped by keys
 *
 * @example
 * ```tsx
 * // Load multiple textures (static)
 * const textures = useLoader(TextureLoader, {
 *    diffuse: 'textures/wood-diffuse.jpg',
 *    normal: 'textures/wood-normal.jpg'
 * })
 *
 * // Load multiple textures (reactive callback)
 * const [theme, setTheme] = createSignal({
 *    diffuse: 'textures/wood-diffuse.jpg',
 *    normal: 'textures/wood-normal.jpg'
 * })
 * const textures = useLoader(TextureLoader, theme)
 *
 * // Load multiple textures (reactive getters)
 * const [urls] = splitProps(props, ['diffuse', 'normal'])
 * const textures = useLoader(TextureLoader, urls)
 *
 * return (
 *   <Suspense>
 *     <T.MeshStandardMaterial map={textures()?.diffuse} normalMap={textures()?.normal} />
 *   </Suspense>
 * )
 * ```
 */
export function useLoader<
  TLoader extends Loader<any, any>,
  TPaths extends Record<string, UrlFromLoader<TLoader> | undefined>,
>(
  loader: S3.Constructor<TLoader>,
  paths: AccessorMaybe<TPaths>,
  options?: UseLoaderOptions<TLoader, { [TKey in keyof TPaths]: DataFromLoader<TLoader> }>,
): Resource<{ [TKey in keyof TPaths]: DataFromLoader<TLoader> }>

/**
 * Hook for loading a single Three.js resource with caching.
 *
 * @template TLoader The Three.js loader type
 * @param loader Three.js loader constructor
 * @param url URL or array of URLs to load (can be a value or accessor)
 * @param options Configuration options
 * @returns Solid.js resource containing the loaded data
 *
 * @example
 * ```tsx
 * // Load a single model (static)
 * const model = useLoader(GLTFLoader, 'models/robot.glb')
 *
 * // Load a single model (reactive)
 * const [url, setUrl] = createSignal('models/robot.glb')
 * const model = useLoader(GLTFLoader, url)
 *
 * return (
 *   <Entity from={model()?.scene} />
 * )
 * ```
 */
export function useLoader<TLoader extends Loader<any, any>>(
  loader: S3.Constructor<TLoader>,
  url: AccessorMaybe<UrlFromLoader<TLoader> | undefined>,
  options?: UseLoaderOptions<TLoader, DataFromLoader<TLoader>>,
): Resource<DataFromLoader<TLoader>>

export function useLoader<TLoader extends Loader<object, any>>(
  constructor: S3.Constructor<TLoader>,
  url: AccessorMaybe<UrlFromLoader<TLoader> | Record<string, UrlFromLoader<TLoader>>>,
  options?: UseLoaderOptions<TLoader, any>,
) {
  const config = merge({ cache: true }, options)

  let loader = LOADER_CACHE.get(constructor) as TLoader

  if (!loader) {
    LOADER_CACHE.set(constructor, (loader = new constructor()))
  }

  const loadUrl = (url: string | string[]) =>
    config.cache
      ? getOrInsertLoaderRegistry(
          // config.cache === true ? useLoader.cache : config.cache,
          useLoader.cache,
          loader,
          url,
        )
      : new Promise<DataFromLoader<TLoader>>((resolve, reject) =>
          // TLoader's URL type is string at runtime for these direct load calls
          (loader as unknown as Loader<DataFromLoader<TLoader>, string>).load(
            url as string,
            resolve,
            undefined,
            reject,
          ),
        )

  const [resource] = createResource(
    () => [resolve(url), options?.base] as const,
    async ([url, base]) => {
      config.onBeforeLoad?.(loader)

      url = base ? resolveUrls(base, url) : url

      if (isRecord(url)) {
        const result = await awaitMapObject(url, async url => {
          const resource = await loadUrl(url)
          return resource
        })

        config?.onLoad?.(result)

        return result
      }

      const result = await loadUrl(url)

      config?.onLoad?.(result)
      return result
    },
  )
  return resource
}

/**
 * Default global cache instance used when `cache: true` is specified.
 * You can overwrite it with your custom implementation, access it to manually manage the cache,
 * or call `emptyFreeList` to dispose of unreferenced resources.
 *
 * @example
 * ```ts
 * // Overwrite with custom implementation (do before loading any resources)
 * useLoader.cache = new MyCustomCache()
 *
 * // Manually clean up unused resources
 * useLoader.cache.emptyFreeList()
 *
 * // Delete a specific resource
 * useLoader.cache.deleteResource(texture, { force: true })
 * ```
 */
useLoader.cache = new LoaderCache()
