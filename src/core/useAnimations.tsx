import { resolve } from '@/utils'
import {
  type Accessor,
  createEffect,
  createMemo,
  createRenderEffect,
  onCleanup,
} from 'solid-js'
import { useFrame } from 'solid-three'
import { AnimationAction, AnimationClip, AnimationMixer, Object3D } from 'three'

type AnimationApi<T extends AnimationClip> = {
  actions: { [key in T['name']]: AnimationAction | null }
  clips: AnimationClip[]
  mixer: AnimationMixer
  names: T['name'][]
  ref: Accessor<Object3D | undefined | null>
}

export function useAnimations<T extends AnimationClip>(
  clips: Accessor<T[]>,
  root?: Accessor<Object3D | undefined | null> | Object3D,
): AnimationApi<T> {
  // Actions are lazily initialized with mixer.clipAction
  let lazyActions: Record<string, AnimationAction> = {}
  const mixer = new AnimationMixer(undefined as unknown as Object3D)

  const resolveRoot = () => resolve(root)

  const actions = createMemo(() => {
    const actions = {} as { [key in T['name']]: AnimationAction | null }
    // Add getters to actions to lazily initialize the actions with mixer.clipAction
    clips().forEach(clip =>
      Object.defineProperty(actions, clip.name, {
        enumerable: true,
        get() {
          const ref = resolveRoot()
          if (!ref) return
          return lazyActions[clip.name] || (lazyActions[clip.name] = mixer.clipAction(clip, ref))
        },
        configurable: true,
      }),
    )
    return actions
  })

  useFrame((_, delta) => {
    mixer.update(delta)
  })

  createRenderEffect(() => {
    // @ts-expect-error
    mixer._root = resolveRoot()
  })

  createEffect(
    () => clips(),
    (clipsValue) => {
      const currentRoot = resolveRoot()
      const currentActions = actions()
      onCleanup(() => {
        // Clean up only when clips change, wipe out lazy actions and uncache clips
        lazyActions = {}
        if (!currentRoot) return
        Object.values(currentActions).forEach(action => {
          mixer.uncacheAction(action as AnimationClip, currentRoot)
        })
      })
    },
  )

  onCleanup(() => mixer.stopAllAction())

  return {
    get actions() {
      return actions()
    },
    get clips() {
      return clips()
    },
    mixer,
    ref() {
      return resolveRoot()
    },
    get names() {
      return clips().map(c => c.name)
    },
  }
}
