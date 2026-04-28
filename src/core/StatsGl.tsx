import { createEffect, onCleanup, splitProps } from 'solid-js'
import { useFrame, useThree } from 'solid-three'
import Stats from 'stats-gl'

type Props = ConstructorParameters<typeof Stats>[0] & {
  className?: string
  parent?: HTMLElement
}

export function StatsGl(_props: Props) {
  const [props, rest] = splitProps(_props, ['className', 'parent'])
  const store = useThree()

  createEffect(async () => {
    const stats = new Stats(rest)
    await stats.init(store.gl.domElement)

    const node = props.parent || document.body
    node?.appendChild(stats.domElement)
    if (props.className)
      stats.domElement.classList.add(...props.className.split(' ').filter(Boolean))

    useFrame(() => stats.begin(), { priority: -Infinity })
    useFrame(() => stats.end(), { priority: Infinity, stage: 'after' })

    onCleanup(() => node?.removeChild(stats.domElement))
  })

  return null
}
