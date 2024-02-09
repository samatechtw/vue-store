import {
  ICreatePlugin,
  IGetters,
  IModule,
  IMutations,
  IPlugin,
  IState,
  LocalStoragePlugin,
  ILocalStoragePluginState,
  flatten,
  createModule,
} from '../lib'

interface IBaseTestState extends IState {
  id: number
}

interface IOldTestState extends IBaseTestState {
  name: string
}

interface INewTestState extends IBaseTestState {
  age: number
}

interface ITestGetters extends IGetters {
  isDefault: () => boolean
}

interface ITestMutations extends IMutations {
  updateId: (id: number) => void
}

const getOldDefaultState = (): IOldTestState => ({
  id: 0,
  name: '',
})

const getNewDefaultState = (): INewTestState => ({
  id: 999,
  age: 5,
})

interface ITestModuleOptions<S extends IBaseTestState> {
  version: number
  stateInit: () => S
  plugins: (ICreatePlugin<S> | IPlugin<S>)[]
}

const makeTestModule = <S extends IBaseTestState>({
  version,
  stateInit,
  plugins,
}: ITestModuleOptions<S>): IModule<S, ITestGetters, ITestMutations> =>
  createModule<S, ITestGetters, ITestMutations>({
    name: 'test',
    version,
    stateInit,
    getters: (state) => ({
      isDefault: () => state.id === 0 && state.name === '',
    }),
    mutations: (state) => ({
      updateId: (id: number) => {
        state.id = id
      },
    }),
    plugins,
  })

describe('vue-store plugins', () => {
  beforeEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
  })

  describe('local stroage plugin', () => {
    it('modify state and save with built-in local storage plugin', async () => {
      const module = flatten(
        makeTestModule<IOldTestState>({
          version: 1,
          stateInit: getOldDefaultState,
          plugins: [LocalStoragePlugin],
        }),
      )
      expect(module.id.value).toEqual(0)

      // Verify default values in localStorage before anything changes
      const stateBefore = JSON.parse(localStorage.getItem('test') || '')
      expect(stateBefore.state.id).toEqual(0)

      // Update id
      const newId = 1
      module.updateId(newId)
      // a workaround to wait until the Vue watch-effect is done
      await Promise.resolve()

      // Verify values in localStorage after state change
      const storedState: ILocalStoragePluginState<IOldTestState> = JSON.parse(
        localStorage.getItem('test') ?? '',
      )
      expect(storedState.state.id).toBe(1)
      expect(storedState.__version).toBe(1)
    })

    it('migrate states when version changes', async () => {
      const oldTestModule = flatten(
        makeTestModule<IOldTestState>({
          version: 1,
          stateInit: getOldDefaultState,
          plugins: [LocalStoragePlugin],
        }),
      )
      expect(oldTestModule.id.value).toEqual(0)
      expect(oldTestModule.name.value).toEqual('')

      // Change state to trigger the save logic in LocalStoragePlugin
      const newIdForOldModule = 123
      oldTestModule.updateId(newIdForOldModule)
      // a workaround to wait until the Vue watch-effect is done
      await Promise.resolve()

      const newTestModule = flatten(
        makeTestModule<INewTestState>({
          version: 2,
          stateInit: getNewDefaultState,
          plugins: [LocalStoragePlugin],
        }),
      )

      // `id` should remain the same, because this property exists in both old and new states
      expect(newTestModule.id.value).toEqual(newIdForOldModule)
      // `age` should be set to default, because it only exists in the new state
      expect(newTestModule.age.value).toEqual(5)
      // `name` should be removed from the store, because it only exists in the old state
      expect('name' in newTestModule).toBe(false)

      // Change state to trigger the save logic in LocalStoragePlugin
      const newIdForNewModule = 456
      newTestModule.updateId(newIdForNewModule)
      // a workaround to wait until the Vue watch-effect is done
      await Promise.resolve()

      // Verify values in localStorage after state change
      const storedState: ILocalStoragePluginState<INewTestState> = JSON.parse(
        localStorage.getItem('test') ?? '',
      )

      expect(storedState.state.id).toEqual(newIdForNewModule)
      expect(storedState.state.age).toEqual(5)
      expect('name' in storedState.state).toBe(false)
    })

    it('refreshes data after manual update', async () => {
      const module = flatten(
        makeTestModule<IOldTestState>({
          version: 1,
          stateInit: getOldDefaultState,
          plugins: [LocalStoragePlugin],
        }),
      )
      // Update id
      const newId = 1
      module.updateId(newId)
      // a workaround to wait until the Vue watch-effect is done
      await Promise.resolve()

      // Manually set localstorage
      localStorage.setItem(
        'test',
        JSON.stringify({ state: { id: 9, name: 'manual' }, __version: 1 }),
      )

      // Refresh module and verify date is changed
      module.refreshData()
      expect(module.id.value).toEqual(9)
      expect(module.name.value).toEqual('manual')
    })
  })
})
