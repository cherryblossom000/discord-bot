export const exit = (error: unknown): never => {
  console.error(error)
  process.exit(1)
}

export default (): void => {
  process.on('unhandledRejection', exit).on('uncaughtException', exit)
}
