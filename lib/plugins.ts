import { IGenericModule, IPlugin, IState } from './interfaces'

export const LocalStoragePlugin = <S extends IState>(
  module: IGenericModule<S>,
): IPlugin<S> => {
  return {
    onStateInit: (state: S) => {
      const stateString = localStorage.getItem(module.options.name)
      if (!stateString) {
        return state
      }
      return JSON.parse(stateString)
    },
    onDataChange: (value: S) => {
      localStorage.setItem(module.options.name, JSON.stringify(value))
    },
  }
}
