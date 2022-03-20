import { IGetters, IModule, IMutations, IState, Module } from '@samatech/vue-store/lib'

interface IUser extends IState {
  id: number
  name: string
}

interface IUserGetters extends IGetters {
  isLoggedIn: () => boolean
  upperCaseName: () => string
}

interface IUserMutations extends IMutations {
  login: (user: IUser) => void
  updateName: (name: string) => void
  logout: () => void
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IUserModule
  extends IModule<IUser, IUserGetters, IUserMutations, never> {}

const getDefaultUser = (): IUser => ({
  id: 0,
  name: '',
})

export const userModule: IUserModule = new Module<
  IUser,
  IUserGetters,
  IUserMutations,
  never
>({
  name: 'user',
  version: 1,
  stateInit: getDefaultUser,
  getters: (state: IUser) => ({
    isLoggedIn: () => state.id > 0,
    upperCaseName: () => state.name.toUpperCase(),
  }),
  mutations: (state: IUser) => ({
    login: (user: IUser) => {
      state.id = user.id
      state.name = user.name
    },
    updateName: (name: string) => (state.name = name),
    logout: () => {
      Object.assign(state, getDefaultUser())
    },
  }),
})
