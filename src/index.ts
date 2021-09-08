import 'module-alias/register'
import fs from 'fs'
import { config } from 'dotenv'
import { OAuth2Client } from 'google-auth-library'
import { app } from '@/app'
import { server } from '@/server'

// TODO: create factories for app and server
config()
const fileName = './db.json'
const db = (fs.existsSync(fileName) && JSON.parse(fs.readFileSync(fileName).toString())) ?? {}

const main = async () => {
  console.log('Start configuration of HTTP server')
  app.post('/auth/:provider', async (req, res) => {
    const { provider } = req.params
    console.log(`Selected auth provider: ${provider} | Cookies: ${JSON.stringify(req.cookies, null, 2)}`)

    switch (provider) {
      case 'google': {
        // validate CSRF
        const csrf_cookie = req.cookies.g_csrf_token
        const csrf_param = req.body.g_csrf_token

        if (!csrf_cookie)
          return res.status(400).json({ message: 'No CSRF token in Cookie.', success: false })
        else if (!csrf_param)
          return res.status(400).json({ message: 'No CSRF token in Body.', success: false })
        else if (csrf_cookie !== csrf_param)
          return res.status(400).json({ message: 'Failed to verify double submit cookie.', success: false })
        
        const token = req.body.credential

        if (!token)
          return res.status(400).json({ message: 'No Id token in Body.', success: false })

        const client_id = process.env.G_CLIENT_ID
        const client = new OAuth2Client(client_id)
        const ticket = await client.verifyIdToken({
          idToken: token,
          audience: client_id
        })
        const payload = ticket.getPayload()

        let user = db[payload.sub]

        if (!user) {
          user = {
            id: payload.sub,
            name: payload.given_name,
            email: payload.email,
            avatar: payload.picture
          }

          db[user.id] = user
          fs.writeFileSync(fileName, JSON.stringify(db, null, 2))
        }

        return res.json({ message: 'Successfully signed in.', success: true, data: user })
      }
    }

    res.json('ok')
  })
  console.log('Finished configuring routes and request handlers')

  console.log('Starting HTTP server')
  const port = process.env.PORT ?? 8080
  server.listen(port, () => console.log(`Server started and is listening on port ${port}`))
}

main().catch(console.error)
