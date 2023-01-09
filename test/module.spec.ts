import {
  ICreatePlugin,
  IGetters,
  IModule,
  IMutations,
  IPlugin,
  IState,
  flatten,
  createModule,
  useModule,
} from '../lib'

type ITestModule = IModule<ITestState, ITestGetters, ITestMutations>

interface ITestState extends IState {
  id: number
  name: string
}

interface ITestGetters extends IGetters {
  isDefault: () => boolean
}

interface ITestMutations extends IMutations {
  updateName: (name: string) => void
  clear: () => void
}

const getDefaultState = (): ITestState => ({
  id: 0,
  name: '',
})

const makeTestModule = (
  plugins?: (ICreatePlugin<ITestState> | IPlugin<ITestState>)[],
): ITestModule =>
  createModule<ITestState, ITestGetters, ITestMutations>({
    name: 'test',
    version: 1,
    stateInit: getDefaultState,
    getters: (state) => ({
      isDefault: () => state.id === 0 && state.name === '',
    }),
    mutations: (state) => ({
      updateName: (name: string) => {
        state.name = name
      },
      clear: () => {
        Object.assign(state, getDefaultState())
      },
    }),
    plugins,
  })

describe('vue-store', () => {
  beforeEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
  })

  it('creates a module', () => {
    const testModule = makeTestModule()
    expect(testModule.options.name).toBeTruthy()
    expect(testModule.options.version).toBeTruthy()
    expect(testModule.options.stateInit).toBeTruthy()
    expect(testModule.options.getters).toBeTruthy()
    expect(testModule.options.mutations).toBeTruthy()
  })

  it('creates a flattened module', () => {
    const flattenedTestModule = flatten(makeTestModule())
    expect(flattenedTestModule.__metadata.name).toBeTruthy()
    expect(flattenedTestModule.__metadata.version).toBeTruthy()
  })

  it('accesses flattened module states', () => {
    const testModule = makeTestModule()
    const flattenedTestModule = flatten(testModule)
    const testModuleDefaultState = testModule.options.stateInit?.()
    expect(flattenedTestModule.id.value).toBe(testModuleDefaultState?.id)
    expect(flattenedTestModule.name.value).toBe(testModuleDefaultState?.name)
  })

  it('calls flattened module getters', () => {
    const flattenedTestModule = flatten(makeTestModule())
    expect(flattenedTestModule.isDefault.value).toBe(true)
  })

  it('calls flattened module mutations', () => {
    const flattenedTestModule = flatten(makeTestModule())
    const name = 'test'
    flattenedTestModule.updateName(name)
    expect(flattenedTestModule.name.value).toBe(name)
  })

  it('uses composable helpers to create modules', () => {
    const value = 'test'
    const root = useModule({
      ...makeTestModule().options,
      name: 'root',
    })
    root.updateName(value)
    expect(root.name.value).toBe(value)
  })

  it('mutate state in the onStateInit hooks of plugins', async () => {
    const [newId, newName] = [123, 'abc']
    const module = flatten(
      makeTestModule([
        {
          onStateInit: (state) => {
            state.id = newId
            return state
          },
        },
        {
          onStateInit: (state) => {
            state.name = newName
            return state
          },
        },
      ]),
    )
    expect(module.id.value).toBe(newId)
    expect(module.name.value).toBe(newName)
  })

  it('mutate state in the onStateInit hooks of plugins', () => {
    const module = flatten(
      makeTestModule([
        {
          onStateInit: (state) => {
            state.id = 100
            return state
          },
        },
        {
          onStateInit: (state) => {
            if (state.id !== undefined) {
              state.id += 23
            }
            return state as ITestState
          },
        },
      ]),
    )
    expect(module.id.value).toBe(123)
  })

  it('save JSON state to localStorage in the onDataChange hook of a plugin', async () => {
    const KEY = 'vue-store-test'
    const module = flatten(
      makeTestModule([
        {
          onDataChange: (value) => {
            localStorage.setItem(KEY, JSON.stringify(value))
          },
        },
      ]),
    )
    const newName = 'vue-store'
    module.updateName(newName)
    // a workaround to wait until the Vue watch-effect is done
    await new Promise((resolve) => {
      const timeoutId = setTimeout(() => {
        clearTimeout(timeoutId)
        return resolve(true)
      }, 1)
    })
    const storedState: ITestState = JSON.parse(localStorage.getItem(KEY) ?? '')
    expect(storedState.name).toBe(newName)
  })
})
