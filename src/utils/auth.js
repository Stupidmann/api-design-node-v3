import config from '../config'
import { User } from '../resources/user/user.model'
import jwt from 'jsonwebtoken'
import { token } from 'morgan'
import { reverse } from 'lodash'

export const newToken = user => {
  return jwt.sign({ id: user.id }, config.secrets.jwt, {
    expiresIn: config.secrets.jwtExp
  })
}

export const verifyToken = token =>
  new Promise((resolve, reject) => {
    jwt.verify(token, config.secrets.jwt, (err, payload) => {
      if (err) return reject(err)
      resolve(payload)
    })
  })

export const signup = async (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res.status(400).send({ message: 'email and password required' })
  }
  try {
    const user = await User.create(req.body)
    const token = newToken(user)
    return res.status(201).send({ token })
  } catch (err) {
    console.error(err)
    return res.status(400).end()
  }
}

export const signin = async (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res.status(400).send({ message: 'email and password required' })
  }
  const user = await User.findOne({ email: req.body.email })
  if (!user) {
    return res.status(401).send({ message: 'user not found' })
  }

  try {
    const valid = await user.checkPassword(req.body.password)
    if (!valid) {
      return res.status(401).send({ message: 'invalid password' })
    }
    const token = newToken(user)
    return res.status(201).send({ token })
  } catch (e) {
    console.error(e)
    return res.status(401).send({ message: 'not auth' })
  }
}

export const protect = async (req, res, next) => {
  const bearer = req.headers.authorization
  if (!bearer) return res.status(401).end()

  const token = bearer.split('Bearer ')[1]
  if (!token) return res.status(401).end()

  try {
    const payload = await verifyToken(token)
    const user = await User.findById(payload.id)
      .select('-password')
      .lean()
      .exec()
    req.user = user
    next()
  } catch (e) {
    console.error(e)
    return res.status(401).end()
  }
}
