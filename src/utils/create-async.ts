import { Accessor, Resource, createResource } from 'solid-js'

export function createAsync<T>(callback: () => T): Resource<Awaited<T>>
export function createAsync<TKey, T>(
  key: Accessor<T> | Resource<TKey>,
  callback: (value: NonNullable<Awaited<TKey>>) => Promise<T> | T,
): Resource<Awaited<T>>
export function createAsync<TKey, T extends Promise<any>>(
  keyOrCallback: Accessor<T> | Resource<TKey>,
  callback?: (value: NonNullable<Awaited<TKey>>) => T | Promise<T>,
) {
  const [resource] = createResource(keyOrCallback, callback)
  return resource
}
