import { computed, reactive, readonly, toRef, UnwrapNestedRefs, watch } from 'vue'
import {
  IFlattenedModule,
  IGetters,
  IModule,
  IModuleMetadata,
  IModuleOptions,
  IMutations,
  IPlugins,
  IState,
  ISubModules,
} from './interfaces'

export class Module<
  S extends IState,
  G extends IGetters,
  M extends IMutations,
  SM extends ISubModules = never,
  P extends IPlugins<S> = IPlugins<S>,
> implements IModule<S, G, M, SM, P>
{
  constructor(public readonly options: IModuleOptions<S, G, M, SM, P>) {}

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

    // plugins
    this.registerOnDataChangeHooks(state)

    return flattenedModule
  }

  private getInitialState(): S | undefined {
    const { stateInit, plugins } = this.options
    const source = stateInit?.()
    if (!plugins?.length) {
      return source
    }
    return plugins.reduce((state, plugin) => {
      if (plugin.onStateInit) {
        return plugin.onStateInit(state ?? {}) as S
      }
      return state
    }, source)
  }

  private registerOnDataChangeHooks(state: UnwrapNestedRefs<S>): void {
    const onDataChangeHooks = this.options.plugins
      ?.filter((x) => x.onDataChange !== undefined)
      .map((x) => x.onDataChange)
    if (onDataChangeHooks?.length) {
      watch(
        state,
        (value, oldValue, onCleanup) => {
          onDataChangeHooks.forEach((callback) =>
            callback?.(value, oldValue as NonNullable<typeof oldValue>, onCleanup),
          )
        },
        {
          immediate: true,
        },
      )
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
