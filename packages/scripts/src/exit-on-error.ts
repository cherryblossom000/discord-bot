const exit = (error: unknown): never => {
	process.exitCode = 1
	throw error
}

export default (): void => {
	process.on('unhandledRejection', exit).on('uncaughtException', exit)
}
