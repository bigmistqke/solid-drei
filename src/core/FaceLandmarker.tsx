/* eslint react-hooks/exhaustive-deps: 1 */
import type { FaceLandmarkerOptions } from '@mediapipe/tasks-vision'
import { FaceLandmarker as FaceLandmarkerImpl, FilesetResolver } from '@mediapipe/tasks-vision'

import type { Accessor } from 'solid-js'
import { createContext, createEffect, createMemo, onCleanup, useContext, type JSX } from 'solid-js'

const FaceLandmarkerContext = createContext((() => {}) as Accessor<FaceLandmarkerImpl | undefined>)

type FaceLandmarkerProps = {
  basePath?: string
  options?: FaceLandmarkerOptions
  children?: JSX.Element | Array<JSX.Element>
}

export const FaceLandmarkerDefaults = {
  basePath: 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.2/wasm',
  options: {
    baseOptions: {
      modelAssetPath:
        'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
      delegate: 'GPU',
    },
    runningMode: 'VIDEO',
    outputFaceBlendshapes: true,
    outputFacialTransformationMatrixes: true,
  } as FaceLandmarkerOptions,
}

export function FaceLandmarker({
  basePath = FaceLandmarkerDefaults.basePath,
  options = FaceLandmarkerDefaults.options,
  children,
}: FaceLandmarkerProps) {
  const faceLandmarker = createMemo(async () => {
    return await FilesetResolver.forVisionTasks(basePath).then((vision) =>
      FaceLandmarkerImpl.createFromOptions(vision, options)
    )
  })

  createEffect(
    () => faceLandmarker(),
    () => {
      onCleanup(() => {
        faceLandmarker()?.close()
        // s3f:  suspend-react caches and can clear the cache, should we clear the cache too?
        // clear([basePath, opts])
      })
    },
  )

  return <FaceLandmarkerContext value={faceLandmarker}>{children}</FaceLandmarkerContext>
}

export function useFaceLandmarker() {
  return useContext(FaceLandmarkerContext)
}
