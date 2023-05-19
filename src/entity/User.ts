import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn, CreateDateColumn, OneToMany} from "typeorm"

import Privileges from '../consts/privileges'
import { Issue } from "./Issue"

@Entity()
export class User {

    @PrimaryGeneratedColumn()
    id: number

    @Column({unique: true})
    username: string

    @Column()
    password: string

    @Column({ nullable: true })
    email: string
    
    @Column({ default: Privileges.USER, enum: Privileges })
    privilege: Privileges

    @OneToMany(() => Issue, (issue) => issue.owner)
    issues: Issue[]

    @CreateDateColumn()
    createdAt: Date
    @UpdateDateColumn()
    updatedAt: Date
}
