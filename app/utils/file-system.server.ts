import fs from 'fs/promises'

const getOrCreateDirectory = async (path: string) => {
  const dir = await fs.readdir(path).catch(async (err) => {
    if (err.code !== 'ENOENT') throw err
    await fs.mkdir(path)
    return fs.readdir(path)
  })

  return dir
}

const readFile = async (path: string) => {
  const file = await fs.readFile(path).then((buff) => buff.toString())
  return file
}

const writeFile = async (path: string, data: string) => {
  await fs.writeFile(path, data)
}

export default { getOrCreateDirectory, readFile, writeFile }
