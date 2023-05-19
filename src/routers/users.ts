import express, { Request, Response } from 'express';

import { AppDataSource } from "../data-source";

import { User } from "../entity/User"

const usersRouter = express.Router()

usersRouter.get('/', async (req: Request, res: Response) => {
    const users = await AppDataSource.getRepository(User).find()
    res.json({count: users.length, results: users});
});
usersRouter.get('/:id', async (req: Request, res: Response) => {
    const result = await AppDataSource.getRepository(User).findOneBy({
        id: Number.parseInt(req.params.id),
    })
    if (result) {
        res.send(result);
    } else {
        res.status(404).json({message: 'User not found'})
    }
});



export {usersRouter}