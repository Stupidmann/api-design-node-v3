import express from 'express'
import { json, urlencoded } from 'body-parser'
import morgan from 'morgan'
import cors from 'cors'

export const app = express()

app.disable('x-powered-by')

app.use(cors())
app.use(json())
app.use(urlencoded({ extended: true }))
app.use(morgan('dev'))

// middleware
const myMiddleware = (req, res, next) => {
  // its a controller-like function that executes in the order
  // they were called, before the controller returns a response
  // it can modify the response data among other things
  console.log("I'm a middleware")
  next()
}

// all this functions (like .post or .get) are called controllers
app.get('/', (req, res) => {
  res.send({ message: 'hello' })
})

app.post('/', (req, res) => {
  console.log(req.body)
  res.send({ message: 'ok' })
})

// test
app.get('/user', (req, res) => {
  res.send({
    name: 'stan',
    surname: 'marsh'
  })
})

// you can call multiples middlewares passsing an array
// app.get('/data', [myMiddleware, myMiddleware, myMiddleware], (req, res) => {
// or you can run the middleware before every controller
// app.use(myMiddleware)
// or call it once
app.get('/data', myMiddleware, (req, res) => {
  res.send({ message: 'returning some data' })
})

app.post('/data', (req, res) => {
  console.log("get echo'd")
  res.send(req.body)
})

export const start = () => {
  app.listen(3000, () => {
    console.log('server is on port 3000')
  })
}
