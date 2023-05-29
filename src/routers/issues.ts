import express, { Request, Response } from 'express';

import { AppDataSource } from "../data-source";

import { Issue } from '../entity/Issue';
import IssueStates from '../consts/issuestates';
import { User } from '../entity/User';

const issuesRouter = express.Router()

issuesRouter.route('/').get(async (req: Request, res: Response) => {
    const {name, user, state, limit, offset} = req.params
    let query = await AppDataSource.getRepository(Issue).createQueryBuilder('issue')
        .leftJoin('issue.owner', 'owner')
        .addSelect(['owner.id', 'owner.username', 'owner.email'])
    if (user === null){
        query.andWhere('issue.owner is NULL')
    }
    if (user || name || state || limit || offset) {
        query.take(Number.parseInt(limit) || 10).skip(Number.parseInt(offset) || 0)
        if (user) query.andWhere('issue.owner.id = :owner', {owner: user})
        if (name) query.andWhere('issue.name = :name', {name: name})
        if (state) {
            const issueState = IssueStates[state.toUpperCase()]
            if (issueState) query.andWhere('issue.state = :state', {state: issueState})
        }
    }
    const issues = await query.getMany()
    res.json({count: issues.length, results: issues});
}).post(async (req: Request, res: Response) => {
    const {name, description, user} = req.body
    if (!name) {
        res.status(400).json({message: 'Missing requires parameter: name'})
    } else {
        const owner = await AppDataSource.getRepository(User)
            .createQueryBuilder('user').select(['user.id', 'user.username', 'user.email'])
            .where({id: user}).getOne()
        const issue = await AppDataSource.getRepository(Issue).create({name, description, owner: owner})
        const result = await AppDataSource.getRepository(Issue).save(issue)
        res.status(201).json(result)
    }
})
issuesRouter.param('id', async (req: Request, res: Response, next, id:string) => {
    const result = await AppDataSource.getRepository(Issue).createQueryBuilder('issue')
        .leftJoin('issue.owner', 'owner')
        .addSelect(['owner.id', 'owner.username', 'owner.email'])
        .where('issue.id = :id', {id: id})
        .getOne()
    if (!result) {
        res.status(404).json({message: 'Issue not found'})
    } else {
        res.locals.issue = result
        next()
    }
}).route('/:id').get(async (req: Request, res: Response) => {
    res.status(200).json(res.locals.issue)
}).patch(async (req: Request, res:Response) => {
    const {name, description, state, user} = req.body
    const issue: Issue = res.locals.issue

    if (name) issue.name = name
    if (description) issue.description = description
    if (state){
        const stateObj = IssueStates[state.toUpperCase()]
        if (stateObj) issue.state = stateObj
    }
    if (user) {
        const newOwner = await AppDataSource.getRepository(User)
            .createQueryBuilder('user').select(['user.id', 'user.username', 'user.email'])
            .where({id: user}).getOne()
        if (newOwner) issue.owner = newOwner
    }
    if (user === null) issue.owner = user

    if (name || description || state || user !== undefined) {
        const result = await AppDataSource.getRepository(Issue).save(issue)
        res.status(200).json(result)
    } else res.status(200).json(issue)
}).delete(async (req: Request, res: Response) => {
    const issue: Issue = res.locals.issue
    const result = await AppDataSource.getRepository(Issue).remove(issue)
    res.status(204).json({})
})

export {issuesRouter}