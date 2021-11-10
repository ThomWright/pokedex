import {execSync, spawn} from "child_process"
import {pingUntilReady} from "../ping-until-ready"

const DOCKER_IMAGE_NAME = "pokedex"
const DOCKER_CONTAINER_NAME = "pokedex-api-test"

/** The port the service listens on. Should really be configured, not hard coded. */
const SERVICE_PORT = 3000

/** The port we can contact the service on. */
export let EXPOSED_PORT = 0

before("Start service", async () => {
  try {
    // Remove stale running container, if it exists for whatever reason
    try {
      execSync(`docker rm -f ${DOCKER_CONTAINER_NAME}`, {stdio: "ignore"})
    } catch (error) {
      // Don't care if this fails
    }

    execSync(`docker run --detach --publish-all\
      --name ${DOCKER_CONTAINER_NAME} \
      ${DOCKER_IMAGE_NAME}`)

    // Stream logs from the Docker container
    const logs = spawn("docker", ["logs", "-f", "-t", DOCKER_CONTAINER_NAME])
    logs.stdout.on("data", (data: Buffer) => console.log(data.toString()))
    logs.stderr.on("data", (data: Buffer) => console.error(data.toString()))
    logs.on("error", (err) =>
      console.error("Error with log stream from Docker container", err),
    )
    logs.unref()

    // Get the exposed port
    const portMapping = execSync(
      `docker port ${DOCKER_CONTAINER_NAME} ${SERVICE_PORT}`,
    ).toString()
    EXPOSED_PORT = parseInt(portMapping.split(":")[1], 10)

    await new Promise((resolve) => {
      setTimeout(resolve, 1000)
    })

    // Wait until the service is up and running
    await pingUntilReady({url: `http://localhost:${EXPOSED_PORT}/health/live`})
  } catch (error) {
    console.error("Could not start service", error)
    throw error
  }
})

after("Stop service", async () => {
  try {
    execSync(`docker rm -f ${DOCKER_CONTAINER_NAME}`)
  } catch (error) {
    console.error("Could not stop service", error)
    throw error
  }
})
