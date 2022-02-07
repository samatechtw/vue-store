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

### Configuration

`VueStore` global configuration is passed to the constructor.

```ts
VueStore({
  // Plugins to serialize/deserialize data
  plugins: [],
})
```

### Plugins

### Usage

Here is an example of basic usage that includes a response interceptor for handling 403 response codes and converting the body to json.

```ts
import { VueStore, VueStorePluginLocal } from '@samatech/vue-store'

const store = new VueStore({
  plugins: [VueStorePluginLocal],
})

// TODO -- usage examples
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

MIT License © 2021 [SamaTech Limited COmpany](https://github.com/samatechtw)
