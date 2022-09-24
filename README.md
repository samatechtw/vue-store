<h2 align='center'>@samatech/vue-store</h2>

<p align='center'>A small SPA storage system based on @vue/reactivity</p>

<p align='center'>
<a href='https://www.npmjs.com/package/@samatech/vue-store'>
  <img src='https://img.shields.io/npm/v/@samatech/vue-store?color=222&style=flat-square'>
</a>
</p>

<br>

## Instructions

### Install

```bash
# With NPM
npm i -S @samatech/vue-store

# With PNPM
pnpm i -S @samatech/vue-store
```

### Usage

Typings can be inferred when initializing modules:

```ts
import { LocalStoragePlugin, useModule, useRootModule } from '@samatech/vue-store'

interface IUser {
  name: string
}

const getDefaultUser = (): IUser => ({
  name: '',
})

const userModule = useModule({
  name: 'user-store',
  version: 1,
  stateInit: getDefaultUser,
  getters: (state: IUser) => ({
    upperCaseName: () => state.name.toUpperCase(),
  }),
  mutations: (state: IUser) => ({
    updateName: (name: string) => (state.name = name),
    logout: () => {
      Object.assign(state, getDefaultUser())
    },
  }),
  plugins: [LocalStoragePlugin],
})

export default store = useRootModule({
  name: 'web-store',
  version: 1,
  subModules: {
    user: userModule,
  },
})
```

Explicit typing:

```ts
import {
  IGetters,
  IMutations,
  IState,
  IPlugin,
  useModule,
  IModule,
  LocalStoragePlugin,
} from '@samatech/vue-store'

export type IUserModule = IModule<IUser, IUserGetters, IUserMutations>

interface IUser extends IState {
  name: string
}

interface IUserGetters extends IGetters {
  upperCaseName: () => string
}

interface IUserMutations extends IMutations {
  updateName: (name: string) => void
  logout: () => void
}

const getDefaultUser = (): IUser => ({
  name: '',
})

export const userModule = useModule<IUser, IUserGetters, IUserMutations>({
  name: 'user',
  version: 1,
  stateInit: getDefaultUser,
  getters: (state: IUser) => ({
    upperCaseName: () => state.name.toUpperCase(),
  }),
  mutations: (state: IUser) => ({
    updateName: (name: string) => (state.name = name),
    logout: () => {
      Object.assign(state, getDefaultUser())
    },
  }),
  plugins: [LocalStoragePlugin],
})
```

### Plugins

Plugins can help initialize state, and operate on state when it changes. A basic [LocalStoragePlugin](./lib/plugins.ts) is provided for persisting a module's state to browser storage.

Writing plugins is straightforward, just provide an object conforming to IPlugin, or a function that accepts a module parameter and returns IPlugin.

```ts
interface IPlugin<S extends IState> {
  // Called when the module is initialized
  onStateInit?: (state: S) => S
  // Called any time the module's state changes
  onDataChange?: WatchCallback<UnwrapNestedRefs<S>, UnwrapNestedRefs<S> | undefined>
}

interface MyState {
  dots: string
}

const dummyPlugin: IPlugin<MyState> = {
  onDataChange: (value) => {
    value.dots += '.'
  },
}
```

## Environment

TODO -- details about using alongside other versions of @vue/reactivity

## Example

See the [`example`](./example) folder.

## Development

We use [PNPM](https://pnpm.io/) workspaces for development

```bash
# Clone
git clone git@github.com:samatechtw/vue-store
cd vue-store

# Install dependencies
pnpm install

# Run example
pnpm run dev

# Build
pnpm run build
```

## License

MIT License © 2022 [SamaTech Limited Company](https://github.com/samatechtw)
