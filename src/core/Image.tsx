import { Ref, Show, splitProps } from 'solid-js'
import { S3, T, extend } from 'solid-three'
import { Color, Mesh, Texture } from 'three'
import { shaderMaterial } from '../materials/shaderMaterial.ts'
import { processProps } from '../utils/process-props.ts'
import { useTexture } from './useTexture.tsx'

interface ImagePropsBase extends Omit<S3.Props<'Mesh'>, 'scale'> {
  ref?: Ref<Mesh>
  segments?: number
  scale?: number | [number, number]
  color?: S3.Color
  zoom?: number
  grayscale?: number
  toneMapped?: boolean
  transparent?: boolean
  opacity?: number
}

type TextureImageProps = ImagePropsBase & { texture: Texture; url?: never }
type UrlImageProps = ImagePropsBase & { texture?: never; url: string }

interface ImageMaterialType extends S3.Props<'ShaderMaterial'> {
  scale?: number[]
  imageBounds?: number[]
  color?: S3.Color
  map: Texture
  zoom?: number
  grayscale?: number
}

declare global {
  namespace SolidThree {
    interface Elements {
      ImageMaterial: ImageMaterialType
    }
  }
}

const ImageMaterialImpl = shaderMaterial(
  {
    color: new Color('white'),
    scale: [1, 1],
    imageBounds: [1, 1],
    map: null,
    zoom: 1,
    grayscale: 0,
    opacity: 1,
  },
  /* glsl */ `
  varying vec2 vUv;
  void main() {
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.);
    vUv = uv;
  }
`,
  /* glsl */ `
  // mostly from https://gist.github.com/statico/df64c5d167362ecf7b34fca0b1459a44
  varying vec2 vUv;
  uniform vec2 scale;
  uniform vec2 imageBounds;
  uniform vec3 color;
  uniform sampler2D map;
  uniform float zoom;
  uniform float grayscale;
  uniform float opacity;
  const vec3 luma = vec3(.299, 0.587, 0.114);
  vec4 toGrayscale(vec4 color, float intensity) {
    return vec4(mix(color.rgb, vec3(dot(color.rgb, luma)), intensity), color.a);
  }
  vec2 aspect(vec2 size) {
    return size / min(size.x, size.y);
  }
  void main() {
    vec2 s = aspect(scale);
    vec2 i = aspect(imageBounds);
    float rs = s.x / s.y;
    float ri = i.x / i.y;
    vec2 new = rs < ri ? vec2(i.x * s.y / i.y, s.y) : vec2(s.x, i.y * s.x / i.x);
    vec2 offset = (rs < ri ? vec2((new.x - s.x) / 2.0, 0.0) : vec2(0.0, (new.y - s.y) / 2.0)) / new;
    vec2 uv = vUv * s / new + offset;
    vec2 zUv = (uv - vec2(0.5, 0.5)) / zoom + vec2(0.5, 0.5);
    gl_FragColor = toGrayscale(texture2D(map, zUv) * vec4(color, opacity), grayscale);
    
    #include <tonemapping_fragment>
    #include <encodings_fragment>
  }
`,
)

function ImageBase(props: Omit<ImageProps, 'url'>) {
  const [config, rest] = processProps(
    props,
    {
      segments: 1,
      scale: 1,
      zoom: 1,
      grayscale: 0,
      opacity: 1,
    },
    [
      'ref',
      'children',
      'color',
      'segments',
      'scale',
      'zoom',
      'grayscale',
      'opacity',
      'texture',
      'toneMapped',
      'transparent',
    ],
  )

  extend({ ImageMaterial: ImageMaterialImpl })

  const planeBounds = () =>
    Array.isArray(config.scale) ? [config.scale[0], config.scale[1]] : [config.scale, config.scale]
  const imageBounds = () => [config.texture?.image.width, config.texture?.image.height]
  return (
    <T.Mesh
      ref={config.ref}
      scale={
        Array.isArray(config.scale) ? [...(config.scale as [number, number]), 1] : config.scale
      }
      {...rest}
    >
      <T.PlaneGeometry args={[1, 1, config.segments, config.segments]} />
      <T.ImageMaterial
        color={config.color}
        map={config.texture!}
        zoom={config.zoom}
        grayscale={config.grayscale}
        opacity={config.opacity}
        scale={planeBounds()}
        imageBounds={imageBounds()}
        toneMapped={config.toneMapped}
        transparent={config.transparent}
      />
      {config.children}
    </T.Mesh>
  )
}

function ImageWithUrl(props: UrlImageProps) {
  const [config, rest] = splitProps(props, ['url'])
  const texture = useTexture(config.url)
  return (
    <Show when={texture()}>
      <ImageBase {...rest} texture={texture()} />
    </Show>
  )
}

function ImageWithTexture(props: TextureImageProps) {
  return <ImageBase {...props} />
}

export type ImageProps = UrlImageProps | TextureImageProps

export function Image(props: ImageProps) {
  return (
    <Show
      when={props.url !== undefined}
      fallback={<ImageWithTexture {...(props as TextureImageProps)} />}
    >
      <ImageWithUrl {...(props as UrlImageProps)} />
    </Show>
  )
}
