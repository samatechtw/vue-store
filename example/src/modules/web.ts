import { useRootModule } from '@samatech/vue-store/lib'
import { userModule } from './user'

export const webModule = useRootModule({
  name: 'web',
  version: 1,
  subModules: {
    user: userModule,
  },
})
