/* eslint react-hooks/exhaustive-deps: 1 */
import type { FaceLandmarkerResult } from '@mediapipe/tasks-vision'
import { easing } from 'maath'
import { Entity, useFrame, useThree } from 'solid-three'
import * as THREE from 'three'
import { MeshBasicMaterial } from 'three'

import { defaultProps } from '@/utils'
import type { Accessor } from 'solid-js'
import {
  createContext,
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
  useContext,
} from 'solid-js'
import { useVideoTexture } from './useVideoTexture'
import { useFaceLandmarker } from './FaceLandmarker'
import type { FacemeshApi, FacemeshProps } from './Facemesh'
import { Facemesh } from './Facemesh'

type VideoTextureSrc = Parameters<typeof useVideoTexture>[0]

function mean(v1: THREE.Vector3, v2: THREE.Vector3) {
  return v1.clone().add(v2).multiplyScalar(0.5)
}

function localToLocal(objSrc: THREE.Object3D, v: THREE.Vector3, objDst: THREE.Object3D) {
  const v_world = objSrc.localToWorld(v)
  return objDst.worldToLocal(v_world)
}

export type FaceControlsProps = {
  /** The camera to be controlled, default: global state camera */
  camera?: THREE.Camera
  /** Whether to autostart the webcam, default: true */
  autostart?: boolean
  /** Enable/disable the webcam, default: true */
  webcam?: boolean
  /** A custom video URL or mediaStream, default: undefined */
  webcamVideoTextureSrc?: VideoTextureSrc
  /** Disable the rAF camera position/rotation update, default: false */
  manualUpdate?: boolean
  /** Disable the rVFC face-detection, default: false */
  manualDetect?: boolean
  /** Callback function to call on "videoFrame" event, default: undefined */
  onVideoFrame?: (e: THREE.Event) => void
  /** Approximate time to reach the target. A smaller value will reach the target faster. */
  smoothTime?: number
  /** Apply position offset extracted from `facialTransformationMatrix` */
  offset?: boolean
  /** Offset sensitivity factor, less is more sensible, default: 80 */
  offsetScalar?: number
  /** Enable eye-tracking */
  eyes?: boolean
  /** Force Facemesh's `origin` to be the middle of the 2 eyes, default: true */
  eyesAsOrigin?: boolean
  /** Constant depth of the Facemesh, default: .15 */
  depth?: number
  /** Enable debug mode, default: false */
  debug?: boolean
  /** Facemesh options, default: undefined */
  facemesh?: FacemeshProps
  ref?: (api: FaceControlsApi) => void
}

type FaceControlsEvents = {
  stream: { stream: Accessor<MediaStream | null | undefined> }
  videoFrame: { texture: Accessor<THREE.VideoTexture | undefined>; time: number }
}
export type FaceControlsApi = THREE.EventDispatcher<FaceControlsEvents> & {
  detect: (video: HTMLVideoElement, time: number) => void
  computeTarget: () => THREE.Object3D
  update: (delta: number, target?: THREE.Object3D) => void
  facemeshApiRef: FacemeshApi
  webcamApiRef: WebcamApi
  play: () => void
  pause: () => void
}

const FaceControlsContext = createContext({} as FaceControlsApi)

export function FaceControls(_props: FaceControlsProps) {
  const props = defaultProps(_props, {
    autostart: true,
    webcam: true,
    manualUpdate: false,
    manualDetect: false,
    smoothTime: 0.25,
    offset: true,
    offsetScalar: 80,
    eyes: false,
    eyesAsOrigin: true,
    depth: 0.15,
    debug: false,
  })

  const store = useThree()
  const explCamera = () => props.camera || store.camera

  let webcamApiRef: WebcamApi = null!
  let facemeshApiRef: FacemeshApi = null!

  const target = new THREE.Object3D()
  const irisRightDirPos = new THREE.Vector3()
  const irisLeftDirPos = new THREE.Vector3()
  const irisRightLookAt = new THREE.Vector3()
  const irisLeftLookAt = new THREE.Vector3()
  const computeTarget: FaceControlsApi['computeTarget'] = () => {
    target.parent = explCamera().parent

    const facemeshApi = facemeshApiRef
    if (facemeshApi) {
      const { outerRef, eyeRightRef, eyeLeftRef } = facemeshApi

      if (eyeRightRef && eyeLeftRef) {
        const { irisDirRef: irisRightDirRef } = eyeRightRef
        const { irisDirRef: irisLeftDirRef } = eyeLeftRef

        if (irisRightDirRef && irisLeftDirRef && outerRef) {
          irisRightDirPos.copy(localToLocal(irisRightDirRef, new THREE.Vector3(0, 0, 0), outerRef))
          irisLeftDirPos.copy(localToLocal(irisLeftDirRef, new THREE.Vector3(0, 0, 0), outerRef))
          target.position.copy(
            localToLocal(
              outerRef,
              mean(irisRightDirPos, irisLeftDirPos),
              explCamera().parent || store.scene,
            ),
          )

          irisRightLookAt.copy(localToLocal(irisRightDirRef, new THREE.Vector3(0, 0, 1), outerRef))
          irisLeftLookAt.copy(localToLocal(irisLeftDirRef, new THREE.Vector3(0, 0, 1), outerRef))
          target.lookAt(outerRef.localToWorld(mean(irisRightLookAt, irisLeftLookAt)))
        }
      } else {
        if (outerRef) {
          target.position.copy(
            localToLocal(outerRef, new THREE.Vector3(0, 0, 0), explCamera().parent || store.scene),
          )
          target.lookAt(outerRef.localToWorld(new THREE.Vector3(0, 0, 1)))
        }
      }
    }

    return target
  }

  const current = new THREE.Object3D()
  const update: FaceControlsApi['update'] = function (delta, target) {
    if (explCamera()) {
      target ??= computeTarget()

      if (props.smoothTime > 0) {
        const eps = 1e-9
        easing.damp3(current.position, target.position, props.smoothTime, delta, undefined, undefined, eps)
        easing.dampE(current.rotation, target.rotation, props.smoothTime, delta, undefined, undefined, eps)
      } else {
        current.position.copy(target.position)
        current.rotation.copy(target.rotation)
      }

      explCamera().position.copy(current.position)
      explCamera().rotation.copy(current.rotation)
    }
  }

  const [faces, setFaces] = createSignal<FaceLandmarkerResult>()
  const faceLandmarker = useFaceLandmarker()
  const detect: FaceControlsApi['detect'] = (video, time) => {
    const result = faceLandmarker()?.detectForVideo(video, time)
    setFaces(result)
  }

  useFrame((_, delta) => {
    if (!props.manualUpdate) {
      update(delta)
    }
  })

  const faceControlsApi: FaceControlsApi = Object.assign(Object.create(THREE.EventDispatcher.prototype), {
    detect,
    computeTarget,
    update,
    get facemeshApiRef() { return facemeshApiRef },
    get webcamApiRef() { return webcamApiRef },
    play: () => {
      webcamApiRef?.videoTextureApiRef?.texture.source.data.play()
    },
    pause: () => {
      webcamApiRef?.videoTextureApiRef?.texture.source.data.pause()
    },
  })

  if (typeof _props.ref === 'function') _props.ref(faceControlsApi)

  createEffect(
    () => ({ manualDetect: props.manualDetect, onVideoFrame: props.onVideoFrame }),
    ({ manualDetect, onVideoFrame }) => {
      const onVideoFrameCb = (e: THREE.Event) => {
        if (!manualDetect) detect((e as any).texture.source.data, (e as any).time)
        if (onVideoFrame) onVideoFrame(e)
      }

      faceControlsApi.addEventListener('videoFrame', onVideoFrameCb)

      onCleanup(() => {
        faceControlsApi.removeEventListener('videoFrame', onVideoFrameCb)
      })
    }
  )

  const points = () => faces()?.faceLandmarks[0]
  const facialTransformationMatrix = () => faces()?.facialTransformationMatrixes?.[0]
  const faceBlendshapes = () => faces()?.faceBlendshapes?.[0]

  return (
    <FaceControlsContext.Provider value={faceControlsApi}>
      {props.webcam && (
        <Webcam
          ref={(api) => { webcamApiRef = api }}
          autostart={props.autostart}
          videoTextureSrc={props.webcamVideoTextureSrc}
        />
      )}

      <Facemesh
        ref={(api) => { facemeshApiRef = api }}
        {...props.facemesh}
        points={points()}
        depth={props.depth}
        facialTransformationMatrix={facialTransformationMatrix()}
        faceBlendshapes={faceBlendshapes()}
        eyes={props.eyes}
        eyesAsOrigin={props.eyesAsOrigin}
        offset={props.offset}
        offsetScalar={props.offsetScalar}
        debug={props.debug}
        rotation-z={Math.PI}
        visible={props.debug}
      >
        <Entity from={MeshBasicMaterial} side={THREE.DoubleSide} />
      </Facemesh>
    </FaceControlsContext.Provider>
  )
}

export const useFaceControls = () => useContext(FaceControlsContext)

//
// Webcam
//

type WebcamApi = {
  videoTextureApiRef: VideoTextureApi | undefined
}

type WebcamProps = {
  videoTextureSrc?: VideoTextureSrc
  autostart?: boolean
  ref?: (api: WebcamApi) => void
}

function Webcam(_props: WebcamProps) {
  const props = defaultProps(_props, { autostart: true })

  const [videoTextureApiRef, setVideoTextureApiRef] = createSignal<VideoTextureApi>()

  const faceControls = useFaceControls()

  const stream: Accessor<MediaStream | null> = createMemo(async () => {
    return !props.videoTextureSrc
      ? await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: { facingMode: 'user' },
        })
      : Promise.resolve(null)
  })

  createEffect(
    () => stream(),
    (s) => {
      faceControls.dispatchEvent({ type: 'stream', stream })

      onCleanup(() => {
        s
          ?.getTracks()
          .forEach(track => track.stop())
      })
    }
  )

  const api: WebcamApi = {
    get videoTextureApiRef() {
      return videoTextureApiRef()
    },
  }

  if (typeof _props.ref === 'function') _props.ref(api)

  return (
    <VideoTexture
      ref={setVideoTextureApiRef}
      src={props.videoTextureSrc || stream()!}
      start={props.autostart}
    />
  )
}

//
// VideoTexture
//

type VideoTextureApi = { texture: THREE.VideoTexture }
type VideoTextureProps = {
  src: VideoTextureSrc
  start: boolean
  ref?: (api: VideoTextureApi) => void
}

function VideoTexture(_props: VideoTextureProps) {
  const texture = useVideoTexture(_props.src, { start: _props.start })
  const video = () => texture()?.source.data as HTMLVideoElement | undefined

  const faceControls = useFaceControls()
  const onVideoFrame = (time: number) => {
    faceControls.dispatchEvent({ type: 'videoFrame', texture, time })
  }
  useVideoFrame(video, onVideoFrame)

  createMemo(() => {
    const t = texture()
    if (t && typeof _props.ref === 'function') _props.ref({ texture: t })
    return t
  })

  return <></>
}

function useVideoFrame(video: Accessor<HTMLVideoElement | undefined>, f: (...args: any) => any) {
  createEffect(
    () => video(),
    (vid) => {
      if (!vid || !(vid as any).requestVideoFrameCallback) return
      let handle: number
      function callback(...args: any) {
        f(...args)
        handle = (vid as any).requestVideoFrameCallback(callback)
      }
      ;(vid as any).requestVideoFrameCallback(callback)

      onCleanup(() => (vid as any).cancelVideoFrameCallback(handle))
    }
  )
}
