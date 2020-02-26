export interface PromiseExecutor<T> {
  (resolve: (value?: T) => void, reject: (reason?: any) => void): void
}