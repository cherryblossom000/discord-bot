export const exit = (error: unknown): void => {
  console.error(error)
  process.exitCode = 1
}

export default (): void => {
  process.on('unhandledRejection', exit).on('uncaughtException', exit)
}
