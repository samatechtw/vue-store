import {
  IGetters,
  IModule,
  IMutations,
  IState,
  IPlugin,
  Module,
} from '@samatech/vue-store/lib'

export type IUserModule = IModule<IUser, IUserGetters, IUserMutations>

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

const getDefaultUser = (): IUser => ({
  id: 0,
  name: '',
})

const localStoragePlugin: IPlugin<IUser> = {
  onStateInit: (state) => {
    const stringifiedState = localStorage.getItem('user')
    if (!stringifiedState) {
      return state
    }
    return JSON.parse(stringifiedState)
  },
  onDataChange: (value) => {
    localStorage.setItem('user', JSON.stringify(value))
  },
}

export const userModule = new Module<IUser, IUserGetters, IUserMutations>({
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
  plugins: [localStoragePlugin],
})
