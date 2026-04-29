import { defaultProps } from '@/utils'
import { render } from '@solidjs/web'
import { easing } from 'maath'
import {
  createContext,
  createEffect,
  createMemo,
  createRenderEffect,
  createSignal,
  omit,
  useContext,
  type JSX,
  type ParentProps,
  type Ref,
} from 'solid-js'
import { Entity, useFrame, useThree } from 'solid-three'
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
const ScrollContext = scrollContext
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
  /** A factor that increases scroll bar travel, default: 1 */
  distance?: number
  enabled?: boolean
  /** Precision, default 0.00001 */
  eps?: number
  /** Horizontal scroll, default false (vertical) */
  horizontal?: boolean
  /** Infinite scroll, default false (experimental!) */
  infinite?: boolean
  /** maxSpeed optionally allows you to clamp the maximum speed. Default: Infinity */
  maxSpeed?: number
  /** Defines the length of the scroll area, each page is height:100%, default 1 */
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
    style: {} as JSX.CSSProperties,
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

  createEffect(
    () => [config.horizontal, config.pages, config.distance, config.style] as const,
    () => {
      el.style.position = 'absolute'
      el.style.width = '100%'
      el.style.height = '100%'
      el.style[config.horizontal ? 'overflowX' : 'overflowY'] = 'auto'
      el.style[config.horizontal ? 'overflowY' : 'overflowX'] = 'hidden'
      el.style.top = '0px'
      el.style.left = '0px'

      const style = config.style
      if (style) {
        for (const key in style) {
          ;(el.style as unknown as Record<string, string>)[key] = (
            style as unknown as Record<string, string>
          )[key]
        }
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

      return () => {
        if (target().contains(el)) target().removeChild(el)
      }
    },
  )

  createEffect(
    () => [config.enabled, config.infinite, config.horizontal] as const,
    () => {
      const containerLength = store.bounds[config.horizontal ? 'width' : 'height']
      const scrollLength = el[config.horizontal ? 'scrollWidth' : 'scrollHeight']
      const scrollThreshold = scrollLength - containerLength

      let current = 0
      let disableScroll = true
      let firstRun = true

      const onScroll = () => {
        // Prevent first scroll because it is indirectly caused by the one pixel offset
        if (!config.enabled || firstRun) return
        store.requestRender()
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

      const onWheel = (e: WheelEvent) => (el.scrollLeft += e.deltaY / 2)
      if (config.horizontal) el.addEventListener('wheel', onWheel, { passive: true })

      return () => {
        el.removeEventListener('scroll', onScroll)
        if (config.horizontal) el.removeEventListener('wheel', onWheel)
      }
    },
  )

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
    if (state().delta > config.eps) store.requestRender()
  })
  return <ScrollContext value={state()}>{config.children}</ScrollContext>
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
  let groupRef: Group = null!
  const scroll = useScrollContext()
  const store = useThree()

  createEffect(
    () => groupRef,
    () => {
      if (typeof props.ref === 'function') props.ref(groupRef)
      else props.ref = groupRef
    },
  )

  useFrame(() => {
    groupRef.position.x = scroll.horizontal
      ? -store.viewport.width * (scroll.pages - 1) * scroll.offset
      : 0
    groupRef.position.y = scroll.horizontal
      ? 0
      : store.viewport.height * (scroll.pages - 1) * scroll.offset
  })

  return (
    <Entity from={Group} ref={(g: Group) => (groupRef = g)}>
      {props.children}
    </Entity>
  )
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
  const rest = omit(props, 'children', 'style', 'ref')
  const config = props
  const [ref, setRef] = createSignal<HTMLDivElement>()

  const scroll = useScrollContext()!
  const store = useThree()

  createEffect(
    () => ref(),
    r => {
      if (r) {
        createEffect(
          () => props.ref,
          () => {
            if (typeof props.ref === 'function') props.ref(r)
            else props.ref = r
          },
        )
        useFrame(() => {
          if (scroll.delta > scroll.eps) {
            r.style.transform = `translate3d(${
              scroll.horizontal ? -store.bounds.width * (scroll.pages - 1) * scroll.offset : 0
            }px,${
              scroll.horizontal ? 0 : store.bounds.height * (scroll.pages - 1) * -scroll.offset
            }px,0)`
          }
        })
      }
    },
  )

  createRenderEffect(
    () => scroll.fixed,
    fixed => {
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
            <ScrollContext value={scroll}>{config.children}</ScrollContext>
          </div>
        ),
        fixed,
      )
    },
  )
  return null
}

/**********************************************************************************/
/*                                                                                */
/*                                      Scroll                                    */
/*                                                                                */
/**********************************************************************************/

type ScrollProps = {
  ref?: unknown
  html?: boolean
  children?: JSX.Element
}

export function Scroll(props: ScrollProps) {
  const rest = omit(props, 'html')
  const config = props
  const Component = (config.html ? ScrollHtml : ScrollCanvas) as unknown as (
    p: typeof rest,
  ) => JSX.Element
  return <Component {...rest} />
}
