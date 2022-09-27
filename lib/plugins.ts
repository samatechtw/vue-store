import { IGenericModule, IPlugin, IState } from './interfaces'

interface ILocalStoragePluginState<S extends IState> {
  state: S
  __version: number
}

export const LocalStoragePlugin = <S extends IState>(
  module: IGenericModule<S>,
): IPlugin<S> => {
  return {
    onStateInit: (state: S) => {
      const stateString = localStorage.getItem(module.options.name)
      if (!stateString) {
        return state
      }
      const payload = JSON.parse(stateString) as ILocalStoragePluginState<S>
      if (payload.__version !== module.options.version) {
        console.warn(
          // eslint-disable-next-line max-len
          `Module with name '${module.options.name}' changed from ${payload.__version} to ${module.options.version}. The state has been reset.`,
        )
        return state
      }
      return payload.state
    },
    onDataChange: (value: S) => {
      const payload: ILocalStoragePluginState<S> = {
        state: value,
        __version: module.options.version,
      }
      localStorage.setItem(module.options.name, JSON.stringify(payload))
    },
  }
}
