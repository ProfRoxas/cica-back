import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn, CreateDateColumn, ManyToOne} from "typeorm"
import IssueStates from "../consts/issuestates"
import { User } from "./User"

@Entity()
export class Issue {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @Column({default: ''})
    description: string

    @Column({default: IssueStates.NEW, enum: IssueStates})
    state: string

    @ManyToOne(() => User, (user) => user.issues)
    owner: User

    @CreateDateColumn()
    createdAt: Date
    @UpdateDateColumn()
    updatedAt: Date

}
