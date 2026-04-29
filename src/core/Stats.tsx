import { defaultProps } from '@/utils'
import { createEffect } from 'solid-js'
import { useFrame } from 'solid-three'
import StatsImpl from 'stats.js'

type Props = {
  showPanel?: number
  className?: string
  parent?: HTMLElement
}

export function Stats(props: Props): null {
  const config = defaultProps(props, {
    showPanel: 0,
  })

  const stats = new StatsImpl()

  createEffect(
    () => config.showPanel,
    () => {
      stats.showPanel(config.showPanel)
    },
  )

  createEffect(
    () => [config.parent, config.className] as const,
    () => {
      const node = config.parent || document.body

      node?.appendChild(stats.dom)

      if (config.className) {
        stats.dom.classList.add(...config.className.split(' ').filter(Boolean))
      }

      useFrame(() => stats.begin(), { priority: -Infinity })
      useFrame(() => stats.end(), { priority: Infinity, stage: 'after' })

      return () => node?.removeChild(stats.dom)
    },
  )

  return null
}
