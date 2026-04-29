import { defaultProps } from '@/utils'
import { createMemo, createRenderEffect, type Accessor } from 'solid-js'
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

const normalsList = createMemo(async () => {
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

  const url = () => {
    const list = normalsList()?.list
    if (!list) return undefined
    const name = list[id()] ?? list[0]
    return `${NORMAL_ROOT}/normals/${name}`
  }

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

  if (onLoad) {
    createMemo(() => {
      const tex = texture()
      if (tex) onLoad(tex)
      return tex
    })
  }

  return createMemo(() => {
    const list = normalsList()
    const url_ = url()
    const texture_ = texture()
    if (!list || !url_ || !texture_) return undefined
    return {
      count: list.count,
      url: url_,
      texture: texture_,
    }
  })
}
