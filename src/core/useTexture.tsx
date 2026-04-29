import type { AccessorMaybe } from '@/utils/types'
import { merge, type Resource } from 'solid-js'
import { useThree } from 'solid-three'
import { Texture, TextureLoader } from 'three'
import { useLoader, type UseLoaderOptions } from './useLoader'

export function useTexture<T extends string | undefined>(
  input: AccessorMaybe<T>,
  options?: UseLoaderOptions<TextureLoader, Texture>,
): Resource<Texture>

export function useTexture<T extends Record<string, string | undefined>>(
  input: AccessorMaybe<T>,
  options?: UseLoaderOptions<TextureLoader, Texture>,
): Resource<{ [TKey in keyof T]: Texture }>

export function useTexture<T extends string>(
  input: AccessorMaybe<T | undefined>,
  options?: UseLoaderOptions<TextureLoader, Texture>,
): any {
  const store = useThree()
  return useLoader(
    TextureLoader,
    input,
    merge(options, {
      onLoad(texture: Texture) {
        store.gl.initTexture(texture)
        options?.onLoad?.(texture)
      },
    }),
  )
}
