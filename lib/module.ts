import { computed, reactive, readonly, toRaw, toRef, UnwrapNestedRefs, watch } from 'vue'
import {
  IFlattenedModule,
  IGetters,
  IModule,
  IModuleMetadata,
  IModuleOptions,
  IMutations,
  IPlugin,
  IState,
} from './interfaces'

export function useModule<S extends IState, G extends IGetters, M extends IMutations>(
  options: IModuleOptions<S, G, M>,
): IFlattenedModule<S, G, M> {
  const module = new Module<S, G, M>(options)
  return module.flatten()
}

export class Module<S extends IState, G extends IGetters, M extends IMutations>
  implements IModule<S, G, M>
{
  plugins?: IPlugin<S>[]

  constructor(public readonly options: IModuleOptions<S, G, M>) {
    this.plugins = options.plugins?.map((pluginInit) => {
      if (typeof pluginInit === 'function') {
        return pluginInit(this)
      }
      return pluginInit
    })
  }

  flatten(): IFlattenedModule<S, G, M> {
    const flattenedModule = {} as IFlattenedModule<S, G, M>

    // metadata
    flattenedModule.__metadata = this.getMetadata()

    // state
    const initialState = this.getInitialState()
    const state = reactive(initialState ?? ({} as S))

    // map state properties to Ref<T>
    for (const key in state) {
      flattenedModule[key] = readonly(toRef(state, key)) as IFlattenedModule<
        S,
        G,
        M
      >[Extract<keyof UnwrapNestedRefs<S>, string>]
    }

    // getters
    const getters = this.options.getters?.(state) ?? ({} as G)
    for (const key in getters) {
      flattenedModule[key] = computed(getters[key]) as IFlattenedModule<S, G, M>[Extract<
        keyof G,
        string
      >]
    }

    // mutations
    const mutations = this.options.mutations?.(state) ?? ({} as M)
    for (const key in mutations) {
      flattenedModule[key] = mutations[key] as IFlattenedModule<S, G, M>[Extract<
        keyof M,
        string
      >]
    }

    // plugins
    this.registerOnDataChangeHooks(state)

    return flattenedModule
  }

  private getInitialState(): S {
    const { stateInit } = this.options
    const source = stateInit?.() ?? ({} as S)
    if (!this.plugins?.length) {
      return source
    }
    return this.plugins.reduce((state, plugin) => {
      if (plugin.onStateInit) {
        return plugin.onStateInit(state)
      }
      return state
    }, source)
  }

  private registerOnDataChangeHooks(state: UnwrapNestedRefs<S>): void {
    const onDataChangeHooks = this.plugins
      ?.filter((plugin) => plugin.onDataChange !== undefined)
      .map((plugin) => plugin.onDataChange)
    if (onDataChangeHooks?.length) {
      watch(state, (value, oldValue, onCleanup) => {
        const rawState = toRaw(value)
        for (const dataChangeHook of onDataChangeHooks) {
          dataChangeHook?.(rawState, oldValue, onCleanup)
        }
      })
    }
  }

  private getMetadata(): IModuleMetadata {
    const { name, version } = this.options
    return {
      name,
      version,
    }
  }
}
