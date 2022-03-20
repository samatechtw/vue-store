import { Module } from '@samatech/vue-store/lib'
import { userModule } from './user'

const webRootModule = new Module({
  name: 'web',
  version: 1,
  subModules: {
    user: userModule,
  },
})

export const webModule = webRootModule.flatten()
