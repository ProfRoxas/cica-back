import express, { Express, Request, Response } from 'express';
import { AppDataSource } from "./data-source"

import { usersRouter } from './routers/users';
import { authRouter } from './routers/auth';

const app = express()
const port = 4000
app.use(express.json())

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

app.listen(port)