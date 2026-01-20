export const logInfo = (message: string) => {
  console.log(`[INFO] ${new Date().toISOString()} - ${message}`)
}

export const logError = (message: string) => {
  console.error(`[ERROR] ${new Date().toISOString()} - ${message}`)
}
