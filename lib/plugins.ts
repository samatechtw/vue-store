import { IGenericModule, IPlugin, IState } from './interfaces'

export interface ILocalStoragePluginState<S extends IState> {
  state: S
  __version: number
}

const migrateState = <S extends IState>(oldState: IState, newState: S): S => {
  const migratedState = {} as S

  for (const key in newState) {
    const [oldValue, newValue] = [oldState[key], newState[key]]
    if (key in oldState && typeof oldValue === typeof newValue) {
      migratedState[key as keyof S] = oldValue
    } else {
      migratedState[key as keyof S] = newValue
    }
  }

  return migratedState
}

export const LocalStoragePlugin = <S extends IState>(
  module: IGenericModule<S>,
): IPlugin<S> => {
  const onDataChange = (value: S): S => {
    const payload: ILocalStoragePluginState<S> = {
      state: value,
      __version: module.options.version,
    }
    localStorage.setItem(module.options.name, JSON.stringify(payload))
    return value
  }
  return {
    onStateInit: (state: S) => {
      const { name, version } = module.options
      const stateString = localStorage.getItem(name)
      let initializedState: S
      if (!stateString) {
        initializedState = state
      } else {
        const payload = (JSON.parse(stateString) || {}) as ILocalStoragePluginState<S>
        if (payload.__version !== version) {
          console.warn(
            `Upgrade module '${name}' from ${payload.__version ?? 0} to ${version}.\n` +
              'States has been migrated',
          )
          initializedState = migrateState(payload.state ?? {}, state)
        } else {
          initializedState = payload.state
        }
      }
      return onDataChange(initializedState)
    },
    onDataChange,
  }
}
