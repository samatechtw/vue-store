import { DeepReadonly } from 'vue'
import { Getters, Mutations, Module } from '@samatech/vue-store'

interface User {
  id: number
  name: string
}

interface UserGettersInterface extends Getters<User> {
  isLoggedIn: (state: DeepReadonly<User>) => boolean
  upperCaseName: (state: DeepReadonly<User>) => string
}

interface UserMutationsInterface extends Mutations<User> {
  login: (state: User) => (user: User) => void
  updateName: (state: User) => (name: string) => void
  logout: (state: User) => () => void
}

const getDefaultUser = (): User => ({
  id: 0,
  name: '',
})

// or return a new instance every time for reusability
export const userModule = new Module<User, UserGettersInterface, UserMutationsInterface>({
  state: getDefaultUser,
  getters: {
    isLoggedIn: (state) => state.id > 0,
    upperCaseName: (state) => state.name.toUpperCase(),
  },
  mutations: {
    login: (state) => (user) => {
      Object.assign(state, user)
    },
    updateName: (state) => (name: string) => {
      state.name = name
    },
    logout: (state) => () => {
      Object.assign(state, getDefaultUser())
    },
  },
})
