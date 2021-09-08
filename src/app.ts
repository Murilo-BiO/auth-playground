import express from 'express'
import cookieParser from 'cookie-parser'

export const app = express()

app.use(express.json())
app.use(express.urlencoded())
app.use(cookieParser())
app.use(express.static(`${__dirname}/../public`))
