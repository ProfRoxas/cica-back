import express, { Request, Response } from 'express';

import { AppDataSource } from "../data-source";

import { User } from "../entity/User"
import { Issue } from '../entity/Issue';

const issuesRouter = express.Router()

issuesRouter.get('/', async (req: Request, res: Response) => {
    const {name, user, state, limit, offset} = req.body
    const users = await AppDataSource.getRepository(Issue).find()
    res.json({count: users.length, results: users});
});
issuesRouter.get('/:id', async (req: Request, res: Response) => {
    const result = await AppDataSource.getRepository(Issue).findOneBy({
        id: Number.parseInt(req.params.id),
    })
    if (result) {
        res.send(result);
    } else {
        res.status(404).json({message: 'User not found'})
    }
});

export {issuesRouter}