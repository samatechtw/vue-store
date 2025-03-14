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

A basic module with explicit typing. See [here](./example/src/modules/web.ts) for a slightly more advanced example.

```ts
import {
  IGetters,
  IMutations,
  IState,
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

Typescript's `ReturnType` feature can be used to avoid the need for defining explicit interfaces:

```ts
import { LocalStoragePlugin, useModule, useRootModule } from '@samatech/vue-store'

interface IUser {
  name: string
}

const getDefaultUser = (): IUser => ({
  name: '',
})

const getters = (state: IUser) => ({
  upperCaseName: () => state.name.toUpperCase(),
})

const mutations = (state: IUser) => ({
  updateName: (name: string) => (state.name = name),
  logout: () => {
    Object.assign(state, getDefaultUser())
  },
})

const userModule = useModule<
  IUser,
  ReturnType<typeof getters>,
  ReturnType<typeof mutations>
>({
  name: 'user-store',
  version: 1,
  stateInit: getDefaultUser,
  getters,
  mutations,
  plugins: [LocalStoragePlugin],
})

export const store = useRootModule({
  name: 'web-store',
  version: 1,
  subModules: {
    user: userModule,
  },
})
```

#### Undefined handling

If a state field is set to `undefined`, it will not appear in the flattened module, or be saved with the LocalStoragePlugin. It is recommended to use `null` instead, and make use of strict type checking to avoid accidentally setting fields to `undefined`. It is possible to add `undefined` support to the LocalStoragePlugin, please file a feature request or submit a PR if you need this functionality.

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
pnpm run all:dev

# Build
pnpm run build
```

## License

MIT License © 2021 - 2025 [SamaTech Limited Company](https://github.com/samatechtw)
