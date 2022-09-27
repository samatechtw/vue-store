import { IGenericModule, IPlugin, IState } from './interfaces'

export interface ILocalStoragePluginState<S extends IState> {
  state: S
  __version: number
}

export const LocalStoragePlugin = <S extends IState>(
  module: IGenericModule<S>,
): IPlugin<S> => {
  return {
    onStateInit: (state: S) => {
      const { name, version } = module.options
      const stateString = localStorage.getItem(name)
      if (!stateString) {
        return state
      }
      const payload = JSON.parse(stateString) as ILocalStoragePluginState<S>
      if (payload.__version !== version) {
        console.warn(
          `Upgrade module '${name}' from ${payload.__version} to ${version}.\n` +
            'The state has been reset.',
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
