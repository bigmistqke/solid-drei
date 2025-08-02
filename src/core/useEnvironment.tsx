import { createMemo, createRenderEffect, createResource } from 'solid-js'
// import { useLoader } from 'solid-three'
import { awaitLoader } from 'solid-three'
import {
  CubeReflectionMapping,
  CubeTextureLoader,
  EquirectangularReflectionMapping,
  Loader,
  TextureEncoding,
} from 'three'
import { EXRLoader, RGBELoader } from 'three-stdlib'
import { when } from '../utils/conditionals.ts'
import { defaultProps } from '../utils/default-props.ts'
import { PresetsType, presetsObj } from '../utils/environment-assets.ts'

const CUBEMAP_ROOT =
  'https://raw.githack.com/pmndrs/drei-assets/456060a26bbeb8fdf79326f224b6d99b8bcce736/hdri/'
const isArray = (arr: any): arr is string[] => Array.isArray(arr)

export type EnvironmentLoaderProps = {
  files?: string | string[]
  path?: string
  preset?: PresetsType
  extensions?: (loader: Loader) => void
  encoding?: TextureEncoding
}

export function useEnvironment(props: Partial<EnvironmentLoaderProps> = {}) {
  const config = defaultProps(props, {
    files: ['/px.png', '/nx.png', '/py.png', '/ny.png', '/pz.png', '/nz.png'],
    path: '',
  })

  const sRGBEncoding = 3001
  const LinearEncoding = 3000

  const data = createMemo<{ files: string | string[]; path: string }>(previous => {
    let { files, path, preset } = config
    if (preset) {
      if (!(preset in presetsObj)) {
        throw new Error('Preset must be one of: ' + Object.keys(presetsObj).join(', '))
      }
      files = presetsObj[config.preset]
      path = CUBEMAP_ROOT
    }
    if (previous.files === files && path === path) {
      return previous
    }
    return { files, path }
  })

  const [resource] = createResource(data, ({ files, path }) => {
    if (isArray(files)) {
      return awaitLoader(CubeTextureLoader, files, loader => {
        loader.setPath?.(path)
        if (config.extensions) config.extensions(loader)
      })
    }

    const loader = files.startsWith('data:application/exr')
      ? EXRLoader
      : files.startsWith('data:application/hdr')
      ? RGBELoader
      : undefined

    if (loader) {
      return awaitLoader(loader, files, loader => {
        loader.setPath?.(path)
        if (config.extensions) config.extensions(loader)
      })
    }
  })

  createRenderEffect(() =>
    when(resource, texture => {
      if (Array.isArray(config.files)) {
        texture[0].mapping = CubeReflectionMapping
        if ('colorSpace' in texture) {
          texture.colorSpace = config.encoding ?? 'srgb'
        } else {
          //@ts-expect-error
          texture.encoding = config.encoding ?? sRGBEncoding
        }
      } else {
        texture.mapping = EquirectangularReflectionMapping
        if ('colorSpace' in texture) {
          texture.colorSpace = config.encoding ?? 'srgb-linear'
        } else {
          //@ts-expect-error
          texture.encoding = config.encoding ?? LinearEncoding
        }
      }
    }),
  )

  return resource
}
