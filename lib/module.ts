import { computed, reactive, readonly, toRaw, toRef, UnwrapNestedRefs, watch } from 'vue'
import {
  IFlattenedModule,
  IGetters,
  IModule,
  IModuleOptions,
  IMutations,
  IState,
} from './interfaces'

export function useModule<S extends IState, G extends IGetters, M extends IMutations>(
  options: IModuleOptions<S, G, M>,
): IFlattenedModule<S, G, M> {
  const module = createModule<S, G, M>(options)
  return flatten(module)
}

export function createModule<S extends IState, G extends IGetters, M extends IMutations>(
  options: IModuleOptions<S, G, M>,
): IModule<S, G, M> {
  const module: IModule<S, G, M> = {
    options,
  }
  module.plugins = options.plugins?.map((pluginInit) => {
    if (typeof pluginInit === 'function') {
      return pluginInit(module)
    }
    return pluginInit
  })
  return module
}

export function flatten<S extends IState, G extends IGetters, M extends IMutations>(
  module: IModule<S, G, M>,
): IFlattenedModule<S, G, M> {
  const flattenedModule = {} as IFlattenedModule<S, G, M>
  const { options, plugins } = module

  const getInitialState = (): S => {
    const { stateInit } = options
    const source = stateInit?.() ?? ({} as S)
    if (!plugins?.length) {
      return source
    }
    return plugins.reduce((state, plugin) => {
      if (plugin.onStateInit) {
        return plugin.onStateInit(state)
      }
      return state
    }, source)
  }

  const registerOnDataChangeHooks = (state: UnwrapNestedRefs<S>): void => {
    const onDataChangeHooks = plugins
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

  // metadata
  flattenedModule.__metadata = {
    name: options.name,
    version: options.version,
  }

  // state
  const initialState = getInitialState()
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
  const getters = options.getters?.(state) ?? ({} as G)
  for (const key in getters) {
    flattenedModule[key] = computed(getters[key]) as IFlattenedModule<S, G, M>[Extract<
      keyof G,
      string
    >]
  }

  // mutations
  const mutations = options.mutations?.(state) ?? ({} as M)
  for (const key in mutations) {
    flattenedModule[key] = mutations[key] as IFlattenedModule<S, G, M>[Extract<
      keyof M,
      string
    >]
  }

  // plugins
  registerOnDataChangeHooks(state)

  return flattenedModule
}
