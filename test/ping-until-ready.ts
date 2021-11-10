import {backOff} from "exponential-backoff"
import got from "got"

export const pingUntilReady = async ({url}: {url: string}) => {
  console.log(`Waiting for '${url}'...`)

  await backOff(() => got.get(url, {throwHttpErrors: true}), {
    numOfAttempts: 20,
    timeMultiple: 1.2,
    startingDelay: 100,
    maxDelay: 1000,
    retry: () => {
      console.log("... not ready")
      return true
    },
  })

  console.log("... ready")
}
