import { getOwner, onCleanup } from 'solid-js'
import type { Loader } from 'three'
import { TreeRegistry } from '../utils/tree-registry'

/**
 * Interface for Three.js loader resource registries.
 */
export interface LoaderRegistry {
  /**
   * Stores a resource promise/data in the registry.
   * @param loader The Three.js loader instance
   * @param url The URL or path to the resource
   * @param data The resource promise or resolved data
   */
  set<TData extends object, TUrl extends string | string[]>(
    loader: Loader<TData, TUrl>,
    url: TUrl,
    data: Promise<TData>,
  ): void

  /**
   * Retrieves a resource from the registry.
   * @param loader The Three.js loader instance
   * @param url The URL or path to the resource
   * @returns The resource promise, resolved data, or undefined if not found
   */
  get<TData extends object, TUrl extends string | string[]>(
    loader: Loader<TData, TUrl>,
    url: TUrl,
  ): Promise<TData> | TData | undefined
}

/**
 * A caching system for Three.js loader resources with automatic memory management.
 *
 * Features:
 * - Hierarchical path-based storage using TreeRegistry
 * - Automatic reference counting and cleanup
 * - Integration with Solid.js reactive system
 * - Deferred disposal with free list
 * - Multi-loader support with isolated caches
 *
 * @example
 * ```ts
 * const cache = new LoaderCache()
 *
 * // Store a texture load
 * const texturePromise = textureLoader.loadAsync('textures/wood.jpg')
 * cache.set(textureLoader, 'textures/wood.jpg', texturePromise)
 *
 * // Retrieve the texture (with automatic ref counting)
 * const texture = cache.get(textureLoader, 'textures/wood.jpg')
 *
 * // Resources are automatically disposed when no longer referenced
 * ```
 */
export class LoaderCache implements LoaderRegistry {
  /** Map of loader instances to their respective tree registries */
  #registryMap = new Map<Loader<any, any>, TreeRegistry<CacheNode<object>>>()
  /** Weak map for reverse lookup from data to cache nodes */
  #dataMap = new WeakMap<object, CacheNode<object>>()

  /** Set of resources that do not have active references and can be safely cleaned up. */
  freeList = new Set<object>()

  /**
   * Gets or creates a tree registry for a specific loader.
   * @param loader The Three.js loader instance
   * @returns The tree registry for this loader
   * @private
   */
  #registry<T extends object>(loader: Loader<T, any>) {
    let registry = this.#registryMap.get(loader)
    if (!registry) {
      this.#registryMap.set(loader, (registry = new TreeRegistry()))
    }
    return registry as TreeRegistry<CacheNode<T>>
  }

  /**
   * Deletes a cache node and its associated resource.
   * @param node The cache node to delete
   * @param options.force Force deletion even if not in free list
   * @private
   */
  #delete(node: CacheNode<any>, { force }: { force?: boolean } = {}) {
    if (!force && !this.freeList.has(node.data)) {
      console.error(
        `Attempting to delete a non-freed resource. Use { force: true } if you are sure you want to dispose`,
        node.data,
      )
      return
    }

    node.delete()
  }

  /**
   * Disposes all resources in the free list.
   * Should be called periodically to clean up unused resources.
   */
  emptyFreeList() {
    this.freeList.forEach(resource => this.#dataMap.get(resource)?.delete())
  }

  /**
   * Manually deletes a specific resource from the cache.
   * @param resource The resource object to delete
   * @param options.force Force deletion even if resource has active references
   */
  deleteResource(resource: object, options?: { force?: boolean }) {
    const node = this.#dataMap.get(resource)

    if (!node) {
      console.error(`Error while deleting resource ${resource}. Could not find CacheNode.`)
      return
    }

    this.#delete(node, options)
  }

  /**
   * Removes a resource from a specific loader's cache at the given path.
   * @param loader The Three.js loader instance
   * @param path The URL or path to the resource
   * @param options.force Force deletion even if resource has active references
   */
  delete<TData extends object, TUrl extends string | string[]>(
    loader: Loader<TData, TUrl>,
    path: TUrl,
    options?: { force?: boolean },
  ) {
    const node = this.#registry(loader).get(path)

    if (!node) {
      console.error(`Error while deleting path ${path}. Could not find CacheNode.`)
      return
    }

    this.#delete(node, options)
  }

  /**
   * Retrieves a resource from the cache and tracks its usage.
   * Automatically integrates with Solid.js cleanup for reference counting.
   * @param loader The Three.js loader instance
   * @param path The URL or path to the resource
   * @returns The resource promise, resolved data, or undefined if not found
   */
  get<TData extends object, TUrl extends string | string[]>(
    loader: Loader<TData, TUrl>,
    path: TUrl,
  ) {
    const node = this.#registry(loader).get(path)

    if (!node) return undefined

    node.track()
    return node.data
  }

  /**
   * Stores a resource in the cache at the specified path.
   * @param loader The Three.js loader instance
   * @param path The URL or path to store the resource at
   * @param data The resource promise to cache
   * @param options.force Force update even if resource already exists
   * @returns The stored promise
   */
  set<TData extends object, TUrl extends string | string[]>(
    loader: Loader<TData, TUrl>,
    path: TUrl,
    data: Promise<TData>,
    options?: { force?: boolean },
  ) {
    const registry = this.#registry(loader)
    let node = registry.get(path)

    if (node) {
      node.update(data, options)
    } else {
      node = new CacheNode(this.freeList, registry, path, data)
      this.#dataMap.set(data, node)
      registry.set(path, node)
    }

    return data
  }
}

/**
 * Cache node that wraps a Three.js resource with reference counting and lifecycle management.
 * @template T The type of Three.js resource (must be an object)
 * @internal
 */
class CacheNode<T extends object> {
  /** Reference count for this resource */
  count = 0
  /** The cached resource (promise or resolved value) */
  data: Promise<T> | T

  /**
   * Creates a new cache node.
   * @param free The global free list for deferred disposal
   * @param registry The tree registry containing this node
   * @param path The path where this resource is stored
   * @param promise The resource promise to cache
   */
  constructor(
    public free: Set<object>,
    public registry: TreeRegistry<CacheNode<T>>,
    public path: string | string[],
    promise: Promise<T>,
  ) {
    this.data = promise
    this.#set(promise)
  }

  /**
   * Sets the promise and handles resolution.
   * @param promise The resource promise
   * @private
   */
  #set(promise: Promise<T>) {
    this.data = promise
    promise.then(value => {
      // Update data to resolved promise, if it hasn't been updated before
      if (this.data === promise) {
        this.data = value
      }
    })
  }

  /**
   * Disposes the Three.js resource if it has a dispose method.
   * @private
   */
  #dispose() {
    if ('dispose' in this.data && typeof this.data.dispose === 'function') {
      this.data.dispose?.()
    }
  }

  /**
   * Deletes this node and disposes its resource.
   */
  delete() {
    this.#dispose()
    this.registry.delete(this.path)
  }

  /**
   * Tracks usage of this resource within a Solid.js reactive context.
   * Automatically increments reference count and schedules cleanup on component unmount.
   */
  track() {
    if (this.count === 0) {
      this.free.delete(this.data)
    }

    this.count++

    if (!getOwner()) {
      console.warn(
        'Cached resources accessed outside of reactive context will not be automatically freed.',
        this,
      )
    } else {
      onCleanup(() => {
        this.count -= 1
        if (this.count <= 0) {
          this.free.add(this.data)
        }
      })
    }
  }

  /**
   * Updates the cached resource with new data.
   * @param data The new resource promise
   * @param options.force Force update and dispose current resource (default: true)
   */
  update(data: Promise<T>, { force = true }: { force?: boolean } = {}) {
    if (this.data !== data && !force) {
      console.error(
        'Attempted to update already set resource. To overwrite and dispose of current resource, use { force: true } instead.',
      )
    } else {
      this.#dispose()
      this.#set(data)
      this.registry.set(this.path, this)
    }
  }
}
