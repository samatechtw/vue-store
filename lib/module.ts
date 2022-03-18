import { ComputedRef, DeepReadonly, Ref } from 'vue'

export interface ModuleInterface<
  S extends State,
  G extends Getters<S>,
  M extends Mutations<S>,
> {
  state: () => S
  getters: G
  mutations: M
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface State extends Record<string, any> {}

export interface Getters<S extends State>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  extends Record<string, (state: DeepReadonly<S>) => any> {}

export type ComputedGetters<S extends State, G extends Getters<S>> = {
  [key in keyof G]: ComputedRef<ReturnType<G[key]>>
}

export interface Mutations<S extends State>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  extends Record<string, (state: S) => (...args: Array<any>) => void> {}

export type MappedMutations<S extends State, M extends Mutations<S>> = {
  [key in keyof M]: ReturnType<M[key]>
}

export class Module<S extends State, G extends Getters<S>, M extends Mutations<S>>
  implements ModuleInterface<S, G, M>
{
  state: () => S
  getters: G
  mutations: M

  constructor({ state, getters, mutations }: ModuleOptions<S, G, M>) {
    this.state = state
    this.getters = getters ?? ({} as G)
    this.mutations = mutations ?? ({} as M)
  }
}

interface ModuleOptions<S extends State, G extends Getters<S>, M extends Mutations<S>> {
  state: () => S
  getters?: G
  mutations?: M
}

export type FlattenedModule<
  S extends State,
  G extends Getters<S>,
  M extends Mutations<S>,
> = ReadonlyStateRefs<S> & ComputedGetters<S, G> & MappedMutations<S, M>

export type ReadonlyStateRefs<S extends State> = {
  [key in keyof S]: DeepReadonly<Ref<S[key]>>
}
