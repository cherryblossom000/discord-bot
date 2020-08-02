// The actual new logic.
export default (notes: string): string =>
  notes.replace(/##? @comrade-pingu\/[\w-]+ /u, '')
