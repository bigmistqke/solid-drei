import { defaultProps } from '@/utils/default-props'
import type { JSX } from 'solid-js'
import { Entity, Portal, useFrame, useThree } from 'solid-three'
import { Camera, Group, Scene } from 'three'

/**********************************************************************************/
/*                                                                                */
/*                                    RenderHud                                   */
/*                                                                                */
/**********************************************************************************/

interface RenderHudProps {
  defaultScene: Scene
  defaultCamera: Camera
  renderPriority?: number
}

function RenderHud(props: RenderHudProps) {
  const config = defaultProps(props, { renderPriority: 1 })

  const store = useThree()
  let oldClear: boolean

  useFrame(
    () => {
      oldClear = store.gl.autoClear

      if (config.renderPriority === 1) {
        // Clear scene and render the default scene
        store.gl.autoClear = true
        store.gl.render(config.defaultScene, config.defaultCamera)
      }

      // Disable cleaning and render the portal with its own camera
      store.gl.autoClear = false
      store.gl.clearDepth()
      store.gl.render(store.scene, store.currentCamera)

      // Restore default
      store.gl.autoClear = oldClear
    },
    () => config.renderPriority,
  )

  // Without an element that receives pointer events state.pointer will always be 0/0
  return <Entity from={Group} onPointerOver={() => null} />
}

/**********************************************************************************/
/*                                                                                */
/*                                       Hud                                      */
/*                                                                                */
/**********************************************************************************/

type HudProps = {
  /** Any React node */
  children: JSX.Element
  /** Render priority, default: 1 */
  renderPriority?: number
}

export function Hud(props: HudProps) {
  const store = useThree()
  return (
    <Portal
      element={new Scene()} /* state={{ events: { priority: (props.renderPriority || 1) + 1 } }} */
    >
      {props.children}
      <RenderHud
        defaultScene={store.scene}
        defaultCamera={store.currentCamera}
        renderPriority={props.renderPriority || 1}
      />
    </Portal>
  )
}
