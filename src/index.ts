import express, { Request, Response } from 'express';
import { AppDataSource } from "./data-source"

import { usersRouter } from './routers/users';
import { authRouter } from './routers/auth';
import { issuesRouter } from './routers/issues';
import { authenticateToken } from './utilities';

import cors from 'cors'

const PORT = process.env.PORT || 4000

const app = express()
app.use(express.json())
app.use(cors())
app.use(async (req: Request, res: Response, next) => {
    console.log(`${Date()}: ${req.method} on ${req.path}`)
    next()
})
app.use('/users', authenticateToken)
app.use('/issues', authenticateToken)

AppDataSource
    .initialize()
    .then(() => {
        console.log("Data Source has been initialized!")
    })
    .catch((err) => {
        console.error("Error during Data Source initialization:", err)
    })

app.get('/', async (req: Request, res: Response) => {
    res.json({message: 'Welcome to CICA'})
})
app.use('/users', usersRouter)
app.use('/auth', authRouter)
app.use('/issues', issuesRouter)

app.listen(PORT)