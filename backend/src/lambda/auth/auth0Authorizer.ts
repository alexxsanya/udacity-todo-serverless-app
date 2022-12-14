import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'
import { verify } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import Axios from 'axios'
import { JwtToken } from '../../auth/Jwt'

const logger = createLogger('auth')

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
const jwksUrl = 'https://alexxsanya.auth0.com/.well-known/jwks.json'

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {

  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User has been authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User unauthorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtToken> {
  try {
    const token = getToken(authHeader)
    // const jwt: Jwt = decode(token, { complete: true }) as Jwt

    // TODO: Implement token verification
    // You should implement it similarly to how it was implemented for the exercise for the lesson 5
    // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/

    const result = await Axios.get(jwksUrl)
    const certifcateData = result['data']['keys'][0]['x5c'][0]
    const auth0Certificate = `-----BEGIN CERTIFICATE-----\n${certifcateData}\n-----END CERTIFICATE-----`

    return verify(token, auth0Certificate, { algorithms: ['RS256'] }) as JwtToken
  } catch(err) {
    logger.error('Failed to authenticate user', err)
  }
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header provided')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('The authentication header is invalid')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
