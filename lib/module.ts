import { computed, reactive, readonly, toRef, UnwrapNestedRefs } from 'vue'
import {
  IFlattenedModule,
  IGetters,
  IModule,
  IModuleMetadata,
  IModuleOptions,
  IMutations,
  IState,
  ISubModules,
} from './interfaces'

export class Module<
  S extends IState,
  G extends IGetters,
  M extends IMutations,
  SM extends ISubModules = never,
> implements IModule<S, G, M, SM>
{
  constructor(public readonly options: IModuleOptions<S, G, M, SM>) {}

  flatten(): IFlattenedModule<S, G, M, SM> {
    const flattenedModule = {} as IFlattenedModule<S, G, M, SM>

    // metadata
    flattenedModule.__metadata = this.getMetadata()

    // state
    const state = reactive(this.options.stateInit?.() ?? ({} as S))

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

    return flattenedModule
  }

  private getMetadata(): IModuleMetadata {
    const { name, version } = this.options
    return {
      name,
      version,
    }
  }
}
