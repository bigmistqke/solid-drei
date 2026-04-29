import { defaultProps } from '@/utils'
import { every, when, whenEffect } from '@/utils/conditionals'
import { createMemo, createRenderEffect, createResource, type Accessor } from 'solid-js'
import { RepeatWrapping, Texture, Vector2 } from 'three'
import { useTexture } from './useTexture'

const NORMAL_ROOT =
  'https://rawcdn.githack.com/pmndrs/drei-assets/7a3104997e1576f83472829815b00880d88b32fb'
const LIST_URL = 'https://cdn.jsdelivr.net/gh/pmndrs/drei-assets@master/normals/normals.json'

interface Settings {
  anisotropy?: number
  offset?: number[]
  repeat?: number[]
}

const [normalsList] = createResource<{ count: number; list: Record<string, string> }>(async () => {
  const list = await fetch(LIST_URL).then(res => res.json())
  return {
    count: Object.keys(list).length,
    list,
  }
})

export function useDreiNormalTexture(
  id: Accessor<number>,
  settings: Settings,
  onLoad?: (texture: Texture | Texture[]) => void,
) {
  const config = defaultProps(settings, { repeat: [1, 1], anisotropy: 1, offset: [0, 0] })

  const url = when(
    () => normalsList()?.list[id()] ?? normalsList()?.list[0],
    name => `${NORMAL_ROOT}/normals/${name}`,
  )

  const texture = useTexture(url, {
    onLoad: (texture: Texture) => {
      texture.wrapS = texture.wrapT = RepeatWrapping
      createRenderEffect(
        () => [config.repeat, config.offset, config.anisotropy] as const,
        () => {
          texture.repeat = new Vector2(config.repeat[0], config.repeat[1])
          texture.offset = new Vector2(config.offset[0], config.offset[1])
          texture.anisotropy = config.anisotropy
          texture.needsUpdate = true
        },
      )
    },
  })

  whenEffect(texture, texture => onLoad?.(texture))

  return createMemo(
    when(every(normalsList, url, texture), ([{ count }, url, texture]) => ({
      count,
      url,
      texture,
    })),
  )
}
