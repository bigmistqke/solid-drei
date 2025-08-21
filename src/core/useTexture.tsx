import { check } from '@/utils/conditionals'
import type { Accessor } from 'solid-js'
import { createEffect, createResource } from 'solid-js'
import { load, useThree } from 'solid-three'
import { TextureLoader } from 'three'

const loader = new TextureLoader()

export function useTexture(input: Accessor<string>) {
  const [texture] = createResource(input, input => load(loader, input))
  const store = useThree()

  // https://github.com/mrdoob/three.js/issues/22696
  // Upload the texture to the GPU immediately instead of waiting for the first render
  createEffect(() => check(texture, store.gl.initTexture))

  return texture
}
