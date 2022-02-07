import { Store } from '@samatech/vue-store'
import { userModule } from './modules/user'

export const webStore = new Store({
  name: 'web-store',
  version: 1,
  modules: {
    user: userModule,
  },
})
