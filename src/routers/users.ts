import express, { Request, Response } from 'express';

import { AppDataSource } from "../data-source";

import { User } from "../entity/User"
import { Issue } from '../entity/Issue';
import { hashPassword, isAdmin } from '../utilities';
import Privileges from '../consts/privileges';

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
    const {username, email, limit, offset} = req.body
    if (email === null){
        query.andWhere('user.email is NULL')
    }
    if (username || email || limit || offset) {
        query.take(limit || 10).skip(offset || 0)
        if (username) query.andWhere('user.username = :username', {username: username})
        if (email) query.andWhere('user.email = :email', {email: email})
    }
    const users = await query.getMany()
    res.json({
        count: users.length,
        results: users
    });
});
usersRouter.route('/:id').get(async (req: Request, res: Response) => {
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
}).patch(async (req: Request, res: Response) => {
    const user = await AppDataSource.getRepository(User).findOneBy({id: Number.parseInt(req.params.id)})
    if (!user) {
        res.status(404).json({message: `User with ID ${req.body.id} not found`})
        return
    }
    const loginUser: User = res.locals.user
    if (isAdmin(loginUser) || loginUser.id == user.id) {
        const {email, password, privileges} = req.body
        if (email) {
            user.email = email
        }
        if (password) {
            user.password = hashPassword(password)
        }
        if (privileges && isAdmin(loginUser)) {
            const privilege_obj = Privileges[privileges.toUpperCase()]
            // owner can set anyone's
            // admin can only give to users
            if (loginUser.privilege === Privileges.OWNER && user.privilege !== Privileges.OWNER) {
                if( loginUser.id != user.id) user.privilege = privilege_obj
            }
            else {
                if (privilege_obj !== Privileges.OWNER){
                    if (loginUser.privilege === privileges.ADMIN && user.privilege === Privileges.USER) {
                        user.privilege = privilege_obj
                    }
                }
            }
        }
        if (email || password || privileges) {
            await AppDataSource.getRepository(User).save(user)
        }

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
}).delete(async (req: Request, res: Response) => {
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
        await AppDataSource.getRepository(User).remove(user)
        res.status(201).json({})
    }
    else {
        res.status(403).json({message: 'Not enough privileges'})
    }
})


export {usersRouter}