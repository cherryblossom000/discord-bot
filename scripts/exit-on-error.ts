export const exit = (error: unknown): never => {
  console.log(error)
  process.exit(1)
}

export default (): void => {
  process.on('unhandledRejection', exit).on('uncaughtException', exit)
}
