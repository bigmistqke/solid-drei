import { createSignal, onMount, Suspense, type JSX } from 'solid-js'
import { createT } from 'solid-three'
import type { Meta } from 'storybook-solidjs-vite'
import * as THREE from 'three'
import { Plane, useTexture, useVideoTexture } from '../../src'
import { Setup } from '../Setup'

const T = createT({ MeshBasicMaterial: THREE.MeshBasicMaterial })

function FallbackMaterial({ url }: { url: string }) {
  const texture = useTexture(url)
  return <T.MeshBasicMaterial map={texture()} toneMapped={false} />
}

function VideoMaterial({ src }: { src: string | MediaStream }) {
  const texture = useVideoTexture(src)
  return <T.MeshBasicMaterial side={THREE.DoubleSide} map={texture()} toneMapped={false} />
}

export function Default() {
  const texture = useVideoTexture(
    'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  )

  return (
    <Suspense>
      <Plane args={[4, 2.25]} rotation={[0, 0, 0]}>
        <T.MeshBasicMaterial side={THREE.DoubleSide} map={texture()} toneMapped={false} />
      </Plane>
    </Suspense>
  )
}

export function WithSuspense() {
  return (
    <Suspense fallback={null}>
      <Plane args={[4, 2.25]}>
        <Suspense fallback={<FallbackMaterial url="images/sintel-cover.jpg" />}>
          <VideoMaterial src="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4" />
        </Suspense>
      </Plane>
    </Suspense>
  )
}

export function MediaStream() {
  const [mediaStream, setMediaStream] = createSignal<MediaStream | null>(null)

  onMount(async () => {
    const mediaStream = await navigator.mediaDevices.getDisplayMedia({ video: true })

    setMediaStream(mediaStream)
  })

  return (
    <Suspense fallback={null}>
      <Plane args={[4, 2.25]}>
        <Suspense fallback={<FallbackMaterial url="images/share-screen.jpg" />}>
          {mediaStream() && <VideoMaterial src={mediaStream()!} />}
        </Suspense>
      </Plane>
    </Suspense>
  )
}

const meta = {
  title: 'Misc/useVideoTexture',
  decorators: [
    (Story: () => JSX.Element) => {
      return (
        <Setup cameraPosition={new THREE.Vector3(0, 0, 3)}>
          <Story />
        </Setup>
      )
    },
  ],
} satisfies Meta

export default meta
