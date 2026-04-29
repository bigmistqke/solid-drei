import type { Accessor } from 'solid-js'
import { createEffect } from 'solid-js'
import { useLoader, useThree } from 'solid-three'
import { CompressedTexture, Texture } from 'three'
import { KTX2Loader } from 'three-stdlib'
import { check } from '@/utils/conditionals'

const cdn = 'https://cdn.jsdelivr.net/gh/pmndrs/drei-assets@master'

const isObject = (value: any): value is Record<string, string> =>
  !Array.isArray(value) && typeof value === 'object' && value !== null

export function useKTX2<Url extends string[] | string | Record<string, string>>(
  input: Url,
  basisPath: string = `${cdn}/basis/`,
): Accessor<
  | (Url extends any[]
      ? CompressedTexture[]
      : Url extends object
      ? { [key in keyof Url]: CompressedTexture | undefined }
      : CompressedTexture)
  | undefined
> {
  const store = useThree()
  const textures = useLoader(
    KTX2Loader,
    isObject(input) ? (Object.values(input) as any) : (input as any),
    {
      onBeforeLoad: (loader: any) => {
        loader.detectSupport(store.gl)
        loader.setTranscoderPath(basisPath)
      },
    },
  )

  // https://github.com/mrdoob/three.js/issues/22696
  // Upload the texture to the GPU immediately instead of waiting for the first render
  createEffect(() =>
    check(textures, tex => {
      const array = Array.isArray(tex) ? tex : [tex]
      array.forEach((t: any) => store.gl.initTexture(t))
    }),
  )

  return () => {
    const loaded = textures()
    if (!loaded) return undefined as any
    if (isObject(input)) {
      const keys = Object.keys(input)
      const arr = Array.isArray(loaded) ? loaded : [loaded]
      const keyed = {} as any
      keys.forEach((key, i) => Object.assign(keyed, { [key]: arr[i] }))
      return keyed
    } else {
      return loaded as any
    }
  }
}
