import { createEffect, onCleanup, omit } from 'solid-js'
import { useFrame, useThree } from 'solid-three'
import Stats from 'stats-gl'

type Props = ConstructorParameters<typeof Stats>[0] & {
  className?: string
  parent?: HTMLElement
}

export function StatsGl(_props: Props) {
  const rest = omit(_props, 'className', 'parent')
  const store = useThree()

  createEffect(
    async () => {
      const stats = new Stats(rest)
      await stats.init(store.gl.domElement)

      const node = _props.parent || document.body
      node?.appendChild(stats.domElement)
      if (_props.className)
        stats.domElement.classList.add(..._props.className.split(' ').filter(Boolean))

      useFrame(() => stats.begin(), { priority: -Infinity })
      useFrame(() => stats.end(), { priority: Infinity, stage: 'after' })

      return { stats, node }
    },
    (prev) => {
      if (prev?.node && prev?.stats)
        prev.node.removeChild(prev.stats.domElement)
    },
  )

  return null
}
