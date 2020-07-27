export const exit = (error: any): never => {
  console.log(error)
  process.exit(1)
}

export default (): void => {
  process.on('unhandledRejection', exit).on('uncaughtException', exit)
}
