import type { AccessorMaybe } from '@/utils/types'
import { merge, type Accessor } from 'solid-js'
import { useLoader, useThree } from 'solid-three'
import { Texture, TextureLoader } from 'three'

type TextureOptions = {
  onLoad?: (texture: Texture) => void
}

export function useTexture<T extends string | undefined>(
  input: AccessorMaybe<T>,
  options?: TextureOptions,
): Accessor<Texture>

export function useTexture<T extends Record<string, string | undefined>>(
  input: AccessorMaybe<T>,
  options?: TextureOptions,
): Accessor<{ [TKey in keyof T]: Texture }>

export function useTexture(input: any, options?: TextureOptions): any {
  const store = useThree()
  return useLoader(TextureLoader, input, {
    onLoad(texture: any) {
      const tex = texture as Texture
      store.gl.initTexture(tex)
      options?.onLoad?.(tex)
    },
  })
}
