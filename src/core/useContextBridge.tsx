import type { Context, JSX } from 'solid-js'
import { useContext } from 'solid-js'

export function useContextBridge(...contexts: Array<Context<any>>) {
  const values = contexts.map(ctx => useContext(ctx))
  return (props: { children: JSX.Element }) =>
    contexts.reduceRight<() => JSX.Element>(
      (acc, Ctx, i) => () => <Ctx.Provider value={values[i]}>{acc()}</Ctx.Provider>,
      () => props.children,
    )()
}
