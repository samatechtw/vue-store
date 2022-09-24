import { LocalStoragePlugin, useModule } from '@samatech/vue-store/lib'

interface IUser {
  id: number
  name: string
}

const getDefaultUser = () => ({
  id: 0,
  name: '',
})

const getters = (state: IUser) => ({
  isLoggedIn: (): boolean => state.id > 0,
  upperCaseName: (): string => state.name.toUpperCase(),
})

const mutations = (state: IUser) => ({
  login: (user: IUser) => {
    state.id = user.id
    state.name = user.name
  },
  updateName: (name: string) => (state.name = name),
  logout: () => {
    Object.assign(state, getDefaultUser())
  },
})

export const userModule = useModule<
  IUser,
  ReturnType<typeof getters>,
  ReturnType<typeof mutations>
>({
  name: 'user',
  version: 1,
  stateInit: getDefaultUser,
  getters,
  mutations,
  plugins: [LocalStoragePlugin],
})
