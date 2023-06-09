import "reflect-metadata"
import { DataSource } from "typeorm"
import { User } from "./entity/User"
import { Issue } from "./entity/Issue"

export const AppDataSource = new DataSource({
    type: "sqlite",
    database: "data/cica.db",
    logging: false,
    entities: [User, Issue],
    migrations: ['./build/migration/*.js'],
    subscribers: [],
})
