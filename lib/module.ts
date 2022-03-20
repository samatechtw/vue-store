import {
  computed,
  ComputedRef,
  DeepReadonly,
  reactive,
  readonly,
  Ref,
  toRef,
  UnwrapNestedRefs,
} from 'vue'

export interface IModule<
  S extends IState,
  G extends IGetters,
  M extends IMutations,
  SM extends ISubModules,
> {
  readonly options: IModuleOptions<S, G, M, SM>
  flatten(): IFlattenedModule<S, G, M, SM>
}

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-interface */
export interface ISubModules extends Record<string, IModule<any, any, any, any>> {}

export interface IState extends Record<string, any> {}

export interface IGetters extends Record<string, () => any> {}

export interface IMutations extends Record<string, (...args: any) => void> {}
/* eslint-enable */

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
  subModules?: SM
}

export class Module<
  S extends IState,
  G extends IGetters,
  M extends IMutations,
  SM extends ISubModules,
> implements IModule<S, G, M, SM>
{
  constructor(public readonly options: IModuleOptions<S, G, M, SM>) {}

  flatten(): IFlattenedModule<S, G, M, SM> {
    const flattenedModule = {} as IFlattenedModule<S, G, M, SM>

    // metadata
    flattenedModule.__metadata = this.getMetadata()

    // state
    const state = reactive(this.options.stateInit?.() ?? ({} as S))
    for (const key in state) {
      // TODO: find the correct typing for this
      flattenedModule[key] = readonly(toRef(state, key)) as IFlattenedModule<
        S,
        G,
        M,
        SM
      >[Extract<keyof UnwrapNestedRefs<S>, string>]
    }

    // getters
    const getters = this.options.getters?.(state) ?? ({} as G)
    for (const key in getters) {
      // TODO: find the correct typing for this
      flattenedModule[key] = computed(getters[key]) as IFlattenedModule<
        S,
        G,
        M,
        SM
      >[Extract<keyof G, string>]
    }

    // mutations
    const mutations = this.options.mutations?.(state) ?? ({} as M)
    for (const key in mutations) {
      // TODO: find the correct typing for this and remove any
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      flattenedModule[key] = mutations[key] as any
    }

    // subModules
    const subModules = this.options.subModules ?? ({} as SM)
    for (const key in subModules) {
      flattenedModule[key] = subModules[key].flatten()
    }

    return flattenedModule
  }

  private getMetadata(): IFlattenedModuleMetadata {
    const { name, version } = this.options
    return {
      name,
      version,
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type IFlattenedModule<
  S extends IState,
  G extends IGetters,
  M extends IMutations,
  SM extends ISubModules,
> = {
  __metadata: IFlattenedModuleMetadata
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

export interface ModuleDataForLocalStorage<S extends IState> {
  version: number
  state: S
}

export interface IFlattenedModuleMetadata {
  name: string
  version: number
}
