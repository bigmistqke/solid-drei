import type { JSX } from 'solid-js'
import { Show } from 'solid-js'
import type { CubeTexture as ThreeCubeTexture } from 'three'
import { useCubeTexture, type Options } from './useCubeTexture'

export type CubeTextureProps = Options & {
  children?: (tex: ThreeCubeTexture) => JSX.Element
  files: string[] | string[][]
}

export function CubeTexture(props: CubeTextureProps) {
  const texture = useCubeTexture(() => props.files, { path: props.path })

  return (
    <Show when={texture() as ThreeCubeTexture | undefined}>
      {t => <>{props.children?.(t())}</>}
    </Show>
  )
}
