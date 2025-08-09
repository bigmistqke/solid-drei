import { processProps } from '@/utils/process-props'
import { createMemo } from 'solid-js'
import type { S3 } from 'solid-three'
import { Entity, useThree } from 'solid-three'
import { CanvasTexture, Texture } from 'three'

interface GradientTextureProps extends Omit<S3.Props<typeof Texture>, 'type'> {
  stops: Array<number>
  colors: Array<string>
  attach?: string
  size?: number
  width?: number
  type?: 'linear' | 'radial'
  innerCircleRadius?: number
  outerCircleRadius?: string | number
}

export function GradientTexture(props: GradientTextureProps) {
  const [config, rest] = processProps(
    props,
    {
      size: 1024,
      width: 16,
      //@ts-ignore - weird error about type never, although the type is clearly defined
      type: GradientType.Linear,
      innerCircleRadius: 0,
      outerCircleRadius: 'auto',
    },
    ['colors', 'innerCircleRadius', 'outerCircleRadius', 'size', 'stops', 'type', 'width'],
  )
  const store = useThree()

  const canvas = createMemo(() => {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')!
    canvas.width = config.width
    canvas.height = config.size

    let gradient: CanvasGradient

    if (config.type === 'linear') {
      gradient = context.createLinearGradient(0, 0, 0, config.size)
    } else {
      const canvasCenterX = canvas.width / 2
      const canvasCenterY = canvas.height / 2
      const radius =
        config.outerCircleRadius !== 'auto'
          ? Math.abs(Number(config.outerCircleRadius))
          : Math.sqrt(canvasCenterX ** 2 + canvasCenterY ** 2)
      gradient = context.createRadialGradient(
        canvasCenterX,
        canvasCenterY,
        Math.abs(config.innerCircleRadius),
        canvasCenterX,
        canvasCenterY,
        radius,
      )
    }

    let i = config.stops.length
    while (i--) {
      gradient.addColorStop(config.stops[i]!, config.colors[i]!)
    }

    context.save()
    context.fillStyle = gradient
    context.fillRect(0, 0, config.width, config.size)
    context.restore()

    return canvas
  })

  return (
    <Entity
      from={new CanvasTexture(canvas())}
      colorSpace={store.gl.outputColorSpace}
      attach="map"
      {...rest}
    />
  )
}
