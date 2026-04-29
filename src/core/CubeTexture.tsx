import { Show } from 'solid-js'
import { Texture } from 'three'
import { useCubeTexture, type Options } from './useCubeTexture'
import type { JSX } from 'solid-js'

export type CubeTextureProps = Options & {
  children?: (tex: Texture) => JSX.Element
  files: string[] | string[][]
}

export function CubeTexture(props: CubeTextureProps) {
  const [texture] = useCubeTexture(() => props.files, { path: props.path })

  return (
    <Show when={texture()}>
      {() => <>{props.children?.(texture()!)}</>}
    </Show>
  )
}
