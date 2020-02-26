import { PromiseExecutor } from "./types";

function MyPromise<T>(executor: PromiseExecutor<T>) {

}

new MyPromise()

// new Promise((resolve, reject) => { })
new Promise()