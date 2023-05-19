import express, { Request, Response } from 'express';

import { AppDataSource } from "../data-source";

import { User } from "../entity/User"
import { Issue } from '../entity/Issue';
import { hashPassword, isAdmin } from '../utilities';

const usersRouter = express.Router()

usersRouter.get('/', async (req: Request, res: Response) => {
    let query = AppDataSource.getRepository(User)
    .createQueryBuilder('user')
    .select([
        'user.id',
        'user.username',
        'user.email',
        'user.privilege',
        'user.createdAt'
    ]).leftJoinAndSelect('user.issues', 'issues')
    const users = await query.getMany()
    console.log(users)
    res.json({
        count: users.length,
        results: users
    });
});
usersRouter.get('/:id', async (req: Request, res: Response) => {
    const result = await AppDataSource.getRepository(User)
    .createQueryBuilder('user')
    .select([
        'user.id',
        'user.username',
        'user.email',
        'user.privilege',
        'user.createdAt'
    ]).leftJoinAndSelect('user.issues', 'issues')
    .where('user.id = :id', {id: req.params.id}).getOne()
    if (result) {
        res.send(result);
    } else {
        res.status(404).json({message: `User with ID ${req.body.id} not found`})
    }
});
usersRouter.patch('/:id', async (req: Request, res: Response) => {
    const user = await AppDataSource.getRepository(User).findOneBy({id: Number.parseInt(req.params.id)})
    if (!user) {
        res.status(404).json({message: `User with ID ${req.body.id} not found`})
        return
    }
    const loginUser: User = res.locals.user
    if (isAdmin(loginUser) || loginUser.id == user.id) {
        const email = req.body.email
        const password = req.body.password
        if (email) {
            user.email = email
        }
        if (password) {
            user.password = hashPassword(password)
        }
        if (email || password) {
            
            await AppDataSource.getRepository(User).save(user)
        }
        else(console.log('Nothing to update'))
        res.status(200).json({
            id: user.id,
            username: user.username,
            email: user.email,
            privilege: user.privilege,
            created: user.createdAt
        })
    }
    else {
        res.status(403).json({message: 'Not enough privileges'})
    }
})
usersRouter.delete('/:id', async (req: Request, res: Response) => {
    const user = await AppDataSource.getRepository(User).findOneBy({id: Number.parseInt(req.params.id)})
    if (!user) {
        res.status(404).json({message: `User with ID ${req.body.id} not found`})
        return
    }
    const loginUser: User = res.locals.user
    if (isAdmin(loginUser) || loginUser.id == user.id) {
        if (user.username != req.body.username) {
            res.status(403).json({message: `Failed the username challenge`})
            return
        }
        console.log(user)
        await AppDataSource.getRepository(User).remove(user)
        res.status(201).json({})
    }
    else {
        res.status(403).json({message: 'Not enough privileges'})
    }
})


export {usersRouter}