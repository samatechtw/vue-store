import {
  IGetters,
  IMutations,
  IState,
  ISubModules,
  Module,
} from '@samatech/vue-store/lib'
import { IUserModule, userModule } from './user'

interface IWebSubModules extends ISubModules {
  user: IUserModule
}

const webRootModule = new Module<IState, IGetters, IMutations, IWebSubModules>({
  name: 'web',
  version: 1,
  subModules: {
    user: userModule,
  },
})

export const webModule = webRootModule.flatten()
