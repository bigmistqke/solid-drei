import { easing } from 'maath'
import {
  RootState,
  T,
  context as fiberContext,
  useFrame,
  useThree,
  type DomEvent,
} from 'solid-three'
// import * as ReactDOM from 'react-dom/client'
import { when } from '@/utils/conditionals'
import { defaultProps } from '@/utils/default-props'
import {
  ParentProps,
  Ref,
  createContext,
  createEffect,
  createMemo,
  createRenderEffect,
  createSignal,
  on,
  onCleanup,
  splitProps,
  untrack,
  useContext,
  type JSX,
} from 'solid-js'
import { Dynamic, render } from 'solid-js/web'
import { Group } from 'three'

/**********************************************************************************/
/*                                                                                */
/*                                 Scroll Context                                 */
/*                                                                                */
/**********************************************************************************/

export interface ScrollContext {
  el: HTMLDivElement
  eps: number
  fill: HTMLDivElement
  fixed: HTMLDivElement
  horizontal: boolean | undefined
  damping: number
  offset: number
  delta: number
  pages: number
  range(from: number, distance: number, margin?: number): number
  curve(from: number, distance: number, margin?: number): number
  visible(from: number, distance: number, margin?: number): boolean
}

const scrollContext = createContext<ScrollContext>(null!)
export function useScrollContext() {
  const context = useContext(scrollContext)
  if (!context) throw 'scrollContext is undefined'
  return context
}

/**********************************************************************************/
/*                                                                                */
/*                                 Scroll Controls                                */
/*                                                                                */
/**********************************************************************************/

export interface ScrollControlsProps extends ParentProps {
  /** Friction in seconds, default: 0.2 (1/5 second) */
  damping?: number
  /** A factor that increases scroll bar travel,default: 1 */
  distance?: number
  enabled?: boolean
  /** Precision, default 0.00001 */
  eps?: number
  /** Horontal scroll, default false (vertical) */
  horizontal?: boolean
  /** Infinite scroll, default false (experimental!) */
  infinite?: boolean
  /** maxSpeed optionally allows you to clamp the maximum speed. If damping is 0.2s and looks OK
   *  going between, say, page 1 and 2, but not for pages far apart as it'll move very rapid,
   *  then a maxSpeed of e.g. 3 which will clamp the speed to 3 units per second, it may now
   *  take much longer than damping to reach the target if it is far away. Default: Infinity */
  maxSpeed?: number
  /** Defines the lenght of the scroll area, each page is height:100%, default 1 */
  pages?: number
  style?: JSX.CSSProperties
}

export function ScrollControls(props: ScrollControlsProps) {
  const config = defaultProps(props, {
    eps: 0.00001,
    enabled: true,
    pages: 1,
    distance: 1,
    damping: 0.25,
    maxSpeed: Infinity,
    style: {},
  })

  const store = useThree()
  const el = document.createElement('div')
  const fill = document.createElement('div')
  const fixed = document.createElement('div')
  const target = () => store.gl.domElement.parentNode! as HTMLElement
  let scroll = 0

  const state = createMemo(() => {
    const state = {
      el,
      eps: config.eps,
      fill,
      fixed,
      horizontal: config.horizontal,
      damping: config.damping,
      offset: 0,
      delta: 0,
      scroll,
      pages: config.pages,
      // 0-1 for a range between from -> from + distance
      range(from: number, distance: number, margin: number = 0) {
        const start = from - margin
        const end = start + distance + margin * 2
        return this.offset < start
          ? 0
          : this.offset > end
          ? 1
          : (this.offset - start) / (end - start)
      },
      // 0-1-0 for a range between from -> from + distance
      curve(from: number, distance: number, margin: number = 0) {
        return Math.sin(this.range(from, distance, margin) * Math.PI)
      },
      // true/false for a range between from -> from + distance
      visible(from: number, distance: number, margin: number = 0) {
        const start = from - margin
        const end = start + distance + margin * 2
        return this.offset >= start && this.offset <= end
      },
    }
    return state
  })

  createEffect(() => {
    el.style.position = 'absolute'
    el.style.width = '100%'
    el.style.height = '100%'
    el.style[config.horizontal ? 'overflowX' : 'overflowY'] = 'auto'
    el.style[config.horizontal ? 'overflowY' : 'overflowX'] = 'hidden'
    el.style.top = '0px'
    el.style.left = '0px'

    for (const key in config.style) {
      el.style[key] = config.style[key]
    }

    fixed.style.position = 'sticky'
    fixed.style.top = '0px'
    fixed.style.left = '0px'
    fixed.style.width = '100%'
    fixed.style.height = '100%'
    fixed.style.overflow = 'hidden'
    el.appendChild(fixed)

    fill.style.height = config.horizontal ? '100%' : `${config.pages * config.distance * 100}%`
    fill.style.width = config.horizontal ? `${config.pages * config.distance * 100}%` : '100%'
    fill.style.pointerEvents = 'none'
    el.appendChild(fill)
    target().appendChild(el)

    // Init scroll one pixel in to allow upward/leftward scroll
    el[config.horizontal ? 'scrollLeft' : 'scrollTop'] = 1

    const oldTarget = untrack(() => (store.events.connected || store.gl.domElement) as HTMLElement)
    requestAnimationFrame(() => store.events.connect?.(el))
    const oldCompute = untrack(() => store.events.compute)

    store.setEvents({
      compute(event: DomEvent, state: RootState) {
        // we are using boundingClientRect because we could not rely on target.offsetTop as canvas could be positioned anywhere in dom
        const { left, top } = target().getBoundingClientRect()
        const offsetX = event.clientX - left
        const offsetY = event.clientY - top
        state.pointer.set(
          (offsetX / state.size.width) * 2 - 1,
          -(offsetY / state.size.height) * 2 + 1,
        )
        state.raycaster.setFromCamera(state.pointer, state.camera)
      },
    })

    onCleanup(() => {
      target().removeChild(el)
      store.setEvents({ compute: oldCompute })
      store.events.connect?.(oldTarget)
    })
  })

  createEffect(() => {
    if (store.events.connected === el) {
      const containerLength = store.bounds[config.horizontal ? 'width' : 'height']
      const scrollLength = el[config.horizontal ? 'scrollWidth' : 'scrollHeight']
      const scrollThreshold = scrollLength - containerLength

      let current = 0
      let disableScroll = true
      let firstRun = true

      const onScroll = () => {
        // Prevent first scroll because it is indirectly caused by the one pixel offset
        if (!config.enabled || firstRun) return
        store.invalidate()
        current = el[config.horizontal ? 'scrollLeft' : 'scrollTop']
        scroll = current / scrollThreshold

        if (config.infinite) {
          if (!disableScroll) {
            if (current >= scrollThreshold) {
              const damp = 1 - state().offset
              el[config.horizontal ? 'scrollLeft' : 'scrollTop'] = 1
              scroll = state().offset = -damp
              disableScroll = true
            } else if (current <= 0) {
              const damp = 1 + state().offset
              el[config.horizontal ? 'scrollLeft' : 'scrollTop'] = scrollLength
              scroll = state().offset = damp
              disableScroll = true
            }
          }
          if (disableScroll) setTimeout(() => (disableScroll = false), 40)
        }
      }
      el.addEventListener('scroll', onScroll, { passive: true })
      requestAnimationFrame(() => (firstRun = false))

      const onWheel = e => (el.scrollLeft += e.deltaY / 2)
      if (config.horizontal) el.addEventListener('wheel', onWheel, { passive: true })

      onCleanup(() => {
        el.removeEventListener('scroll', onScroll)
        if (config.horizontal) el.removeEventListener('wheel', onWheel)
      })
    }
  })

  let last = 0
  useFrame((_, delta) => {
    last = state().offset
    easing.damp(
      state(),
      'offset',
      scroll,
      config.damping,
      delta,
      config.maxSpeed,
      undefined,
      config.eps,
    )
    easing.damp(
      state(),
      'delta',
      Math.abs(last - state().offset),
      config.damping,
      delta,
      config.maxSpeed,
      undefined,
      config.eps,
    )
    if (state().delta > config.eps) store.invalidate()
  })
  return <scrollContext.Provider value={state()}>{config.children}</scrollContext.Provider>
}

/**********************************************************************************/
/*                                                                                */
/*                                  Scroll Canvas                                 */
/*                                                                                */
/**********************************************************************************/

interface ScrollCanvasProps extends ParentProps {
  ref?: Ref<Group>
}

function ScrollCanvas(props: ScrollCanvasProps) {
  let ref: Group
  const scrollContext = useScrollContext()
  const store = useThree()

  createEffect(() => {
    if (typeof props.ref === 'function') props.ref(ref)
    else props.ref = ref
  })

  useFrame(() => {
    ref.position.x = scrollContext.horizontal
      ? -store.viewport.width * (scrollContext.pages - 1) * scrollContext.offset
      : 0
    ref.position.y = scrollContext.horizontal
      ? 0
      : store.viewport.height * (scrollContext.pages - 1) * scrollContext.offset
  })

  return <T.Group ref={ref!}>{props.children}</T.Group>
}

/**********************************************************************************/
/*                                                                                */
/*                                  Scroll Html                                   */
/*                                                                                */
/**********************************************************************************/

interface ScrollHtmlProps extends ParentProps {
  ref?: Ref<HTMLDivElement>
  style?: JSX.CSSProperties
}

function ScrollHtml(props: ScrollHtmlProps) {
  const [config, rest] = splitProps(props, ['children', 'style', 'ref'])
  const [ref, setRef] = createSignal<HTMLDivElement>()

  const scroll = useScrollContext()!
  const store = useThree()
  const fiberState = useContext(fiberContext)

  createEffect(
    when(ref, ref => {
      createEffect(() => {
        if (typeof props.ref === 'function') props.ref(ref)
        else props.ref = ref
      })
      useFrame(() => {
        if (scroll.delta > scroll.eps) {
          ref.style.transform = `translate3d(${
            scroll.horizontal ? -store.bounds.width * (scroll.pages - 1) * scroll.offset : 0
          }px,${
            scroll.horizontal ? 0 : store.bounds.height * (scroll.pages - 1) * -scroll.offset
          }px,0)`
        }
      })
    }),
  )

  // s3f:   added the render in a render-effect since in r3f's codebase
  //        they were doing root.render, with root being `useMemo(() => createRoot(state.fixed))
  //        should we be cleaning up the render-function?
  createRenderEffect(
    on(
      () => scroll.fixed,
      () => {
        render(
          () => (
            <div
              ref={setRef}
              style={{
                ...config.style,
                position: 'absolute',
                top: 0,
                left: 0,
                'will-change': 'transform',
              }}
              {...rest}
            >
              <scrollContext.Provider value={scroll}>
                <fiberContext.Provider value={fiberState}>{config.children}</fiberContext.Provider>
              </scrollContext.Provider>
            </div>
          ),
          scroll.fixed,
        )
      },
    ),
  )
  return null
}

/**********************************************************************************/
/*                                                                                */
/*                                      Scroll                                    */
/*                                                                                */
/**********************************************************************************/

type ScrollProps = {
  ref?: Ref<any>
  html?: boolean
  children?: JSX.Element
}

export function Scroll(props: ScrollProps) {
  const [config, rest] = splitProps(props, ['html'])
  return <Dynamic component={config.html ? ScrollHtml : ScrollCanvas} {...rest} />
}
