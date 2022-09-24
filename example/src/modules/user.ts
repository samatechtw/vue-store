import { LocalStoragePlugin, useModule } from '@samatech/vue-store/lib'

interface IUser {
  id: number
  name: string
}

const getDefaultUser = () => ({
  id: 0,
  name: '',
})

export const userModule = useModule({
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
  plugins: [LocalStoragePlugin],
})
