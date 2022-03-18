import { computed, DeepReadonly, reactive, readonly, toRef, watch } from 'vue'
import {
  ComputedGetters,
  ModuleInterface,
  FlattenedModule,
  Getters,
  MappedMutations,
  Mutations,
  ReadonlyStateRefs,
} from './module'

export interface StoreInterface<R extends ModuleRecord> {
  metadata: DeepReadonly<StoreMetadata>
  modules: FlattenedModules<R>
  save: () => void
}

export interface ModuleRecord
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  extends Record<string, ModuleInterface<any, Getters<any>, Mutations<any>>> {}

export interface StoreMetadata {
  name: string
  version: number
}

export interface StoreOptions<R extends ModuleRecord> {
  name: string
  version: number
  modules: R
}

type ModuleStates<R extends ModuleRecord> = {
  [key in keyof R]: ReturnType<R[key]['state']>
}

export interface StoreDataForLocalStorage<R extends ModuleRecord> {
  version: number
  state: ModuleStates<R>
}

type FlattenedModules<R extends ModuleRecord> = {
  [key in keyof R]: FlattenedModule<
    ReturnType<R[key]['state']>,
    R[key]['getters'],
    R[key]['mutations']
  >
}

export class Store<R extends ModuleRecord> implements StoreInterface<R> {
  metadata!: DeepReadonly<StoreMetadata>
  modules!: FlattenedModules<R>
  private state!: ModuleStates<R>

  constructor(options: StoreOptions<R>) {
    this._initMetadata(options)
    this._initState(options.modules)
    this._initModules(options.modules)
  }

  private _initMetadata({ name, version }: StoreOptions<R>): void {
    if (!name) {
      throw new Error('A store must have a valid name')
    } else if (!version) {
      throw new Error('A store must have a valid version')
    }
    this.metadata = readonly({ name, version })
  }

  private _initState(moduleRecord: R): void {
    const state = {} as ModuleStates<R>
    for (const key in moduleRecord) {
      state[key] = {} as ReturnType<R[Extract<keyof R, string>]['state']>
    }
    this.state = reactive(state) as ModuleStates<R>
  }

  private _initModules(moduleRecord: R): void {
    const prevStoreStr = localStorage.getItem(this.metadata.name)
    const prevStore = prevStoreStr
      ? (JSON.parse(prevStoreStr) as StoreDataForLocalStorage<R>)
      : undefined

    const usePrevStore = prevStore?.version === this.metadata.version

    if (!usePrevStore) {
      console.warn(
        `Version changed from ${prevStore?.version} to ${this.metadata.version}`,
      )
    }

    this.modules = {} as FlattenedModules<R>
    for (const moduleKey in moduleRecord) {
      const rawModule = moduleRecord[moduleKey]
      const moduleState = reactive(
        usePrevStore ? prevStore.state[moduleKey] : rawModule['state'](),
      )
      this.state[moduleKey] = moduleState

      // stateRefs
      const readonlyStateRefs = {} as ReadonlyStateRefs<typeof moduleState>
      for (const key in moduleState) {
        readonlyStateRefs[key] = readonly(toRef(moduleState, key))
      }

      // getters
      const rawModuleGetters = rawModule['getters']
      const computedGetters = {} as ComputedGetters<
        typeof moduleState,
        typeof rawModuleGetters
      >
      const readonlyState = readonly(moduleState)
      for (const key in rawModuleGetters) {
        computedGetters[key] = computed(() => rawModuleGetters[key](readonlyState))
      }

      // mutations
      const rawModuleMutations = rawModule['mutations']
      const mappedMutations = {} as MappedMutations<
        typeof moduleState,
        typeof rawModuleMutations
      >
      for (const key in rawModuleMutations) {
        mappedMutations[key] = rawModuleMutations[key](moduleState)
      }

      // module
      this.modules[moduleKey] = {
        ...readonlyStateRefs,
        ...computedGetters,
        ...mappedMutations,
      } as FlattenedModule<
        typeof moduleState,
        typeof rawModuleGetters,
        typeof rawModuleMutations
      >
    }

    if (!usePrevStore) {
      this.save()
    }

    watch(this.state, () => this.save())
  }

  save(): void {
    localStorage.setItem(
      this.metadata.name,
      JSON.stringify(this._getDataForLocalStorage()),
    )
  }

  private _getDataForLocalStorage(): StoreDataForLocalStorage<R> {
    return {
      version: this.metadata.version,
      state: this.state,
    }
  }
}
