import express, { Request, Response } from 'express';
import { AppDataSource } from "./data-source"

import { usersRouter } from './routers/users';
import { authRouter } from './routers/auth';
import { issuesRouter } from './routers/issues';
import { authenticateToken } from './utilities';

import cors from 'cors'

const PORT = process.env.PORT || 4000
const is_test = process.env.NODE_ENV === 'test'

const app = express()
app.use(express.json())
app.use(cors())
app.use(async (req: Request, res: Response, next) => {
    if(!is_test) console.log(`${Date()}: ${req.method} on ${req.path}`)
    next()
})
app.use('/users', authenticateToken)
app.use('/issues', authenticateToken)

app.get('/', async (req: Request, res: Response) => {
    res.json({message: 'Welcome to CICA'})
})
app.use('/users', usersRouter)
app.use('/auth', authRouter)
app.use('/issues', issuesRouter)

if (!is_test) {
    app.listen(PORT, async () => {
        await AppDataSource
            .initialize()
            .then(async () => {
                console.log("Data Source has been initialized!")
                if (is_test) await AppDataSource.synchronize()
            })
            .catch((err) => {
                console.error("Error during Data Source initialization:", err)
            })
        console.log(`Server is running on Port ${PORT} in ${process.env.NODE_ENV} environment`)
})}

export default app