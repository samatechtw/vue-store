import { ComputedRef, DeepReadonly, Ref, UnwrapNestedRefs, WatchCallback } from 'vue'

export interface IModule<
  S extends IState,
  G extends IGetters,
  M extends IMutations,
  SM extends ISubModules = never,
> {
  readonly options: IModuleOptions<S, G, M, SM>
  flatten(): IFlattenedModule<S, G, M, SM>
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ISubModules {
  [key: string]: IModule<any, any, any, any>
}

export type IState = Record<string, any>

export type IGetters = Record<string, () => any>

export type IMutations = Record<string, (...args: any) => void>

export interface IPlugin<S extends IState> {
  onStateInit?: (state: S) => S
  onDataChange?: WatchCallback<UnwrapNestedRefs<S>, UnwrapNestedRefs<S> | undefined>
}
/* eslint-enable */

export type IGenericModule<S extends IState = IState> = IModule<
  S,
  IGetters,
  IMutations,
  ISubModules
>
export type ICreatePlugin<S extends IState> = (module: IGenericModule<S>) => IPlugin<S>

export interface IModuleOptions<
  S extends IState,
  G extends IGetters,
  M extends IMutations,
  SM extends ISubModules,
> {
  name: string
  version: number
  stateInit?: () => S
  getters?: (state: S) => G
  mutations?: (state: S) => M
  plugins?: (ICreatePlugin<S> | IPlugin<S>)[]
  subModules?: SM
}

export type IFlattenedModule<
  S extends IState,
  G extends IGetters,
  M extends IMutations,
  SM extends ISubModules = never,
> = {
  __metadata: IModuleMetadata
} & {
  [key in keyof S]: DeepReadonly<Ref<S[key]>>
} & {
  [key in keyof G]: ComputedRef<ReturnType<G[key]>>
} & M & {
    [key in keyof NonNullable<SM>]: IFlattenedModule<
      ReturnType<NonNullable<NonNullable<SM>[key]['options']['stateInit']>>,
      ReturnType<NonNullable<NonNullable<SM>[key]['options']['getters']>>,
      ReturnType<NonNullable<NonNullable<SM>[key]['options']['mutations']>>,
      ReturnType<NonNullable<NonNullable<SM>[key]['options']['subModules']>>
    >
  }

export interface IModuleMetadata {
  name: string
  version: number
}