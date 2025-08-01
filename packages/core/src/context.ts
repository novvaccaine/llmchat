import { AsyncLocalStorage } from "node:async_hooks";

export function createContext<T>() {
  const storage = new AsyncLocalStorage<T>()

  return {
    use() {
      const store = storage.getStore()
      if (!store) {
        throw new Error("no store found")
      }
      return store
    },

    provide<R>(value: T, fn: () => R) {
      return storage.run(value, fn)
    }
  }
}
