import express, { Request, Response } from 'express';

import { AppDataSource } from "../data-source";

import { User } from "../entity/User"
import { Issue } from '../entity/Issue';

const issuesRouter = express.Router()

issuesRouter.route('/').get(async (req: Request, res: Response) => {
    const {name, user, state, limit, offset} = req.body
    const users = await AppDataSource.getRepository(Issue).find()
    res.json({count: users.length, results: users});
}).post(async (req: Request, res: Response) => {

})
issuesRouter.param('id', async (req: Request, res: Response, next, id:string) => {
    const result = await AppDataSource.getRepository(Issue).findOneBy({
        id: Number.parseInt(id),
    })
    console.log(result)
    if (!result) {
        res.status(404).json({message: 'Issue not found'})
    } else {
        res.locals.issue = result
        next()
    }
}).route('/:id').get(async (req: Request, res: Response) => {
    res.status(200).json(res.locals.issue)
}).post(async (req: Request, res:Response) => {

    res.status(404).json({message: 'Issue not found'})
})

export {issuesRouter}