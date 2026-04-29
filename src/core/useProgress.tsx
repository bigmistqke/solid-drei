import type { Accessor } from 'solid-js'
import { createStore } from 'solid-js'
import { DefaultLoadingManager } from 'three'

interface Data {
  errors: string[]
  active: boolean
  progress: number
  item: string
  loaded: number
  total: number
}
let saveLastTotalLoaded = 0

const [progress, setProgress] = createStore<Data>({
  errors: [],
  active: false,
  progress: 0,
  item: '',
  loaded: 0,
  total: 0,
})

function useProgress(): Data
function useProgress<T>(selector: (progress: Data) => T): Accessor<T>
function useProgress<T>(selector?: (progress: Data) => T) {
  if (selector) return () => selector(progress)
  return progress
}

DefaultLoadingManager.onStart = (item, loaded, total) => {
  setProgress(() => ({
    active: true,
    item,
    loaded,
    total,
    progress: ((loaded - saveLastTotalLoaded) / (total - saveLastTotalLoaded)) * 100,
    errors: [],
  }))
}
DefaultLoadingManager.onLoad = () => {
  setProgress((state) => ({ ...state, active: false }))
}
DefaultLoadingManager.onError = (item: string) => {
  setProgress((state) => ({ ...state, errors: [...state.errors, item] }))
}
DefaultLoadingManager.onProgress = (item, loaded, total) => {
  if (loaded === total) {
    saveLastTotalLoaded = total
  }
  setProgress(() => ({
    active: true,
    item,
    loaded,
    total,
    progress: ((loaded - saveLastTotalLoaded) / (total - saveLastTotalLoaded)) * 100 || 100,
    errors: [],
  }))
}

export { useProgress }
