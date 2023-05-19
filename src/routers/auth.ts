import express, { Request, Response } from 'express';

import { AppDataSource } from '../data-source';

import { User } from "../entity/User"
import { generateToken, hashPassword } from '../utilities';

const SECRET = process.env.SECRET || 'secret'

const authRouter = express.Router()

authRouter.post('/login', async (req: Request, res: Response) => {
    const {username, password} = req.body
    if (username == undefined || password == undefined){
        res.status(400).json({message:'Missing username or password'});
    }
    else {
        const passHash = hashPassword(password)
        const user = await AppDataSource.getRepository(User)
        .findOneBy({username, password: passHash})
        .catch((error) => {res.status(500).json({message:'Error during Login', error: error}); return});
        if (user) {
            const token = generateToken(user.username)
            
            // 24 hours in milliseconds from now
            const date2 = new Date(Date.now()+(24*60*60*1000))
            res.json({message: 'Login success', token: token, expires: date2})
        } else {
            res.status(404).json({message: 'Invalid Username or Password'})
        }
    }
});
authRouter.post('/register', async (req: Request, res: Response) => {
    const {username, password, email} = req.body
    if( username == undefined || password == undefined) {
        res.status(400).json({message: 'Missing username or password'})
    }
    const password_hash = hashPassword(password)
    const user = AppDataSource.getRepository(User).create({username, password: password_hash, email})
    
    try {
        const results = await AppDataSource.getRepository(User).save(user)
        res.status(201).json({message: `Registration Succeeded with ID ${results.id}`})
    } catch (error) {
        res.status(400).json({message: 'Failed to register user', data: {username, password, email}, error: error})
    }
});

export {authRouter}