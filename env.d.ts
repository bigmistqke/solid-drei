declare global {
  interface ImportMeta {
    env: {
      NODE_ENV: 'production' | 'development'
      PROD: boolean
      DEV: boolean
    }
  }
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'production' | 'development'
      PROD: boolean
      DEV: boolean
    }
  }
}

declare module '*.glsl' {
  const value: string
  export default value
}
declare module '*.glsl?raw' {
  const value: string
  export default value
}
declare module 'troika-three-text'

export {}
