import express, { Express, Request, Response, Router } from 'express';
import { AppDataSource } from '../data-source';

import { User } from "../entity/User"

const authRouter = express.Router()

authRouter.post('/login', async (req: Request, res: Response) => {
    const {username, password} = req.body
    if (username == undefined || password == undefined){
        res.status(400).json({message:'Missing username or password'});
    }
    else {
        const user = await AppDataSource.getRepository(User)
        .findOneBy({username, password})
        .catch((error) => {res.status(500).json({message:'Error during Login', error: error}); return});
        if (user) {
            res.json({message: 'Login success'})
        } else {
            res.status(404).json({message: 'User not found'})
        }
    }
});
authRouter.post('/register', async (req: Request, res: Response) => {
    const {username, password, email} = req.body
    if( username == undefined || password == undefined) {
        res.status(400).json({message: 'Missing username or password'})
    }
    const user = AppDataSource.getRepository(User).create({username, password, email})
    
    try {
        const results = await AppDataSource.getRepository(User).save(user)
        console.log(results)
        res.json({message: `Registration Succeeded with ID ${results.id}`})
    } catch (error) {
        res.status(400).json({message: 'Failed to register user', data: {username, password, email}, error: error})
    }
});

export {authRouter}