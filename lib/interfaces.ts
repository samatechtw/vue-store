import { ComputedRef, DeepReadonly, Ref, UnwrapNestedRefs, WatchCallback } from 'vue'

export interface IModule<S extends IState, G extends IGetters, M extends IMutations> {
  readonly options: IModuleOptions<S, G, M>
  plugins?: IPlugin<S>[]
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export type IState = Record<string, any>

export type IGetters = Record<string, (...args: any) => any>

export type IMutations = Record<string, (...args: any) => void>
/* eslint-enable */

export interface IPlugin<S extends IState> {
  onStateInit?: (state: S) => S
  onDataChange?: WatchCallback<UnwrapNestedRefs<S>, UnwrapNestedRefs<S> | undefined>
}

export type IGenericModule<S extends IState = IState> = IModule<S, IGetters, IMutations>
export type ICreatePlugin<S extends IState> = (module: IGenericModule<S>) => IPlugin<S>

export interface IModuleOptions<
  S extends IState,
  G extends IGetters,
  M extends IMutations,
> {
  name: string
  version: number
  stateInit?: () => S
  getters?: (state: S) => G
  mutations?: (state: S) => M
  plugins?: (ICreatePlugin<S> | IPlugin<S>)[]
}

export type IFlattenedModule<
  S extends IState,
  G extends IGetters,
  M extends IMutations,
> = {
  __metadata: IModuleMetadata
} & {
  [key in keyof S]: DeepReadonly<Ref<S[key]>>
} & {
  [key in keyof G]: ComputedRef<ReturnType<G[key]>>
} & M

export interface IModuleMetadata {
  name: string
  version: number
}
