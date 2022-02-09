import { DeepReadonly } from 'vue'
import { Store, Getters, Mutations, Module } from '../lib'

interface TestState {
  id: number
  name: string
}

interface TestStateGetters extends Getters<TestState> {
  isDefault: (state: DeepReadonly<TestState>) => boolean
  upperCaseName: (state: DeepReadonly<TestState>) => string
}

interface TestStateMutations extends Mutations<TestState> {
  setState: (state: TestState) => (newState: TestState) => void
  updateName: (state: TestState) => (name: string) => void
  clear: (state: TestState) => () => void
}

const getDefaultState = (): TestState => ({
  id: 0,
  name: '',
})

const makeTestModule = () =>
  new Module<TestState, TestStateGetters, TestStateMutations>({
    state: getDefaultState,
    getters: {
      isDefault: (state) => state.id === 0 && state.name === '',
      upperCaseName: (state) => state.name.toUpperCase(),
    },
    mutations: {
      setState: (state) => (user) => {
        Object.assign(state, user)
      },
      updateName: (state) => (name: string) => {
        state.name = name
      },
      clear: (state) => () => {
        Object.assign(state, getDefaultState())
      },
    },
  })

describe('vue-store', () => {
  beforeEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
  })
  it('creates a module', () => {
    const testModule = makeTestModule()
    expect(testModule.getters).toBeTruthy()
    expect(testModule.mutations).toBeTruthy()
    expect(testModule.state).toBeTruthy()
  })

  it('creates a store', () => {
    const testModule = makeTestModule()
    const testStore = new Store({
      name: 'web-store',
      version: 1,
      modules: {
        test: testModule,
      },
    })
    expect(testStore.modules.test.id.value).toBe(0)
    expect(testStore.modules.test.name.value).toBe('')
  })

  it('calls store mutations', () => {
    const testModule = makeTestModule()
    const testStore = new Store({
      name: 'web-store',
      version: 1,
      modules: {
        test: testModule,
      },
    })

    expect(testStore.modules.test.isDefault.value).toBe(true)
    testStore.modules.test.setState({ id: 1, name: 'tester' })
    expect(testStore.modules.test.id.value).toBe(1)
    expect(testStore.modules.test.name.value).toBe('tester')
    expect(testStore.modules.test.upperCaseName.value).toBe('TESTER')
    expect(testStore.modules.test.isDefault.value).toBe(false)
  })
})
