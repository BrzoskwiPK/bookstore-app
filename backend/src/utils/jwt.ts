import jwt from 'jsonwebtoken'
import config from 'config'

export const signJwt = (
  object: Object,
  keyName: 'accessTokenPrivateKey' | 'refreshTokenPrivateKey',
  options?: jwt.SignOptions | undefined,
) => {
  const signInKey = Buffer.from(config.get<string>(keyName), 'base64').toString(
    'ascii',
  )

  return jwt.sign(object, signInKey, {
    algorithm: 'RS256',
  })
}

export const verifyJwt = <T>(
  token: string,
  keyName: 'accessTokenPublicKey' | 'refreshTokenPublicKey',
): T | null => {
  const publicKey = Buffer.from(config.get<string>(keyName), 'base64').toString(
    'ascii',
  )

  try {
    const decodedKey = jwt.verify(token, publicKey) as T
    return decodedKey
  } catch (error) {
    return null
  }
}
