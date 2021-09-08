import { loadGoogleIdentityService } from './google.js'

const googleLoginCallback = async (data) => {
  console.log('Login Callback:', data)
  const headers = new Headers
  headers.set('authorization', `Bearer ${data.credential}`)
  const response = await fetch('http://localhost:8080/auth/google', {
    method: 'POST',
    headers
  })
  const result = await response.json()

  console.log(result)
}

export const main = async () => {
  const google = await loadGoogleIdentityService()
  google.accounts.id.initialize({
    client_id: '1085147165707-c49htr5dca7b9rrsqbs0et5rnst91632.apps.googleusercontent.com',
    ux_mode: 'redirect',
    login_uri: 'http://localhost:8080/auth/google',
    callback: googleLoginCallback
  })

  google.accounts.id.renderButton(document.getElementById('google-login-button'), {
    theme: 'outline',
    size: 'large',
    type: 'standard'
  })
  console.log('Started JS core')
}
