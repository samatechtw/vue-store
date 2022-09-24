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
  ISubModules,
} from './interfaces'

export function useModule<
  S extends IState,
  G extends IGetters,
  M extends IMutations,
  SM extends ISubModules = never,
>(options: IModuleOptions<S, G, M, SM>): IModule<S, G, M, SM> {
  return new Module<S, G, M, SM>(options)
}

export function useRootModule<SM extends ISubModules>(
  options: IModuleOptions<IState, IGetters, IMutations, SM>,
): IFlattenedModule<IState, IGetters, IMutations, SM> {
  const module = new Module<IState, IGetters, IMutations, SM>(options)
  return module.flatten()
}

export class Module<
  S extends IState,
  G extends IGetters,
  M extends IMutations,
  SM extends ISubModules = never,
> implements IModule<S, G, M, SM>
{
  plugins?: IPlugin<S>[]

  constructor(public readonly options: IModuleOptions<S, G, M, SM>) {
    this.plugins = options.plugins?.map((pluginInit) => {
      if (typeof pluginInit === 'function') {
        return pluginInit(this)
      }
      return pluginInit
    })
  }

  flatten(): IFlattenedModule<S, G, M, SM> {
    const flattenedModule = {} as IFlattenedModule<S, G, M, SM>

    // metadata
    flattenedModule.__metadata = this.getMetadata()

    // state
    const initialState = this.getInitialState()
    const state = reactive(initialState ?? ({} as S))

    // map state properties to Ref<T>
    for (const key in state) {
      // TODO: find the correct typing for this
      flattenedModule[key] = readonly(toRef(state, key)) as IFlattenedModule<
        S,
        G,
        M,
        SM
      >['string']
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
      >['string']
    }

    // mutations
    const mutations = this.options.mutations?.(state) ?? ({} as M)
    for (const key in mutations) {
      // TODO: find the correct typing for this
      flattenedModule[key] = mutations[key] as IFlattenedModule<S, G, M, SM>['string']
    }

    // subModules
    const subModules = this.options.subModules ?? ({} as SM)
    for (const key in subModules) {
      flattenedModule[key] = subModules[key].flatten()
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
