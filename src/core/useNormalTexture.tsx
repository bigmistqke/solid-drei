import { every, when } from '@/utils/conditionals'
import { defaultProps } from '@/utils/default-props'
import { createRenderEffect, createResource } from 'solid-js'
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

export function useNormalTexture(
  id = 0,
  settings: Settings,
  onLoad?: (texture: Texture | Texture[]) => void,
) {
  const config = defaultProps(settings, { repeat: [1, 1], anisotropy: 1, offset: [0, 0] })

  const [normalsList] = createResource(['normalsList'], () =>
    fetch(LIST_URL).then(res => res.json() as unknown as Record<string, string>),
  )

  const numTot = when(normalsList, list => Object.keys(list).length)
  const imageName = when(normalsList, list => list[id] || list[0])
  const url = when(imageName, name => `${NORMAL_ROOT}/normals/${name}`)

  const [texture] = createResource(
    url,
    url =>
      new Promise<Texture>(resolve => {
        const texture = useTexture(url, onLoad)
        createRenderEffect(when(texture, resolve))
      }),
  )

  createRenderEffect(
    when(texture, texture => {
      texture.wrapS = texture.wrapT = RepeatWrapping
      texture.repeat = new Vector2(config.repeat[0], config.repeat[1])
      texture.offset = new Vector2(config.offset[0], config.offset[1])
      texture.anisotropy = config.anisotropy
    }),
  )

  return when(every(texture, url, numTot), ([texture, url, numTot]) => ({
    texture,
    url,
    numTot,
  }))
}
