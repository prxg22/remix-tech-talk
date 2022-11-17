const encode = (str: string) => Buffer.from(str).toString('base64url')
const decode = (str: string) => Buffer.from(str, 'base64url').toString('utf-8')

export default { encode, decode }
