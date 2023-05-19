
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { Request, Response } from 'express'
import { User } from './entity/User'
import Privileges from './consts/privileges'
import { AppDataSource } from './data-source'

const SECRET = process.env.SECRET || 'secret'

const hashPassword = (password: string, type?: string) => {
    return crypto.createHash(type || 'sha512').update(password).digest('hex')
}

const generateToken = (username: string) => {
    return jwt.sign({username}, SECRET, {expiresIn: '24h'})
}

const authenticateToken = (req: Request, res: Response, next: any) => {
    const authHeader = req.headers['authorization']
    const bearer = authHeader && authHeader.split(' ')
    if (bearer === undefined || bearer.length !== 2) {
        res.status(401).json({message: 'Missing Authorization Token'})
    }
    else if (bearer[0] != 'Bearer') {
        res.status(401).json({message: 'Missing Authorization Token'})
    }
    else {
        const token = bearer[1]
        jwt.verify(token, SECRET, async (err: any, user: any) => {
            if (err) {
                res.status(403).json({message: 'Invalid Authorization Token'})
                return
            }
            const {username, iat} = user
            const loginDate = new Date(iat*1000)
            const loginUser = await AppDataSource.getRepository(User).findOneBy({username: username})
            if(!loginUser || loginUser.updatedAt > loginDate) {
                res.status(403).json({message: 'Expired Authorization Token'})
                return
            }
            res.locals.user = loginUser
            next()
        })
    }
}

const isAdmin = (user: User) => {
    return user.privilege == Privileges.ADMIN || user.privilege == Privileges.OWNER
}

export { hashPassword, generateToken, authenticateToken, isAdmin }