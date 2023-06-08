import app from "../.."
import Privileges from "../../consts/privileges"
import { AppDataSource } from "../../data-source"
import { User } from "../../entity/User"
import { hashPassword, isAdmin, generateToken } from "../../utilities"

import request from "supertest"


describe("Authentication Routes", () => {
    const username = "admin"
    const password = "admin"
    let token = '';
    const server = request(app)
    const hashpass = hashPassword(password)
    beforeAll(async () => {
        AppDataSource.setOptions({database: ":memory:", synchronize: true})
        await AppDataSource.initialize()
        
        await AppDataSource.getRepository(User).save({username: username, password: hashpass})
        // await AppDataSource.synchronize()
        token = generateToken(username);
    })

    it("Register same name", async () => {
        const resp = await server.post("/auth/register").send({username: username, password: password})
        expect(resp.body).toEqual({message: "Username is already taken"})
        expect(resp.status).toBe(400)
    })
    it("Register new user", async () => {
        const newUsername = "second_user"
        const resp = await server.post("/auth/register").send({username: newUsername, password: password})
        const user = await AppDataSource.getRepository(User).findOneBy({username: newUsername, password: hashpass})
        expect(user).toBeDefined()
        expect(resp.body).toEqual({message: `Registration Succeeded with ID ${user.id}`})
        expect(resp.status).toBe(201)
        
    })
    it("User not found login", async () => {
        const resp = await server.post("/auth/login").send({username: "username", password: password})
        expect(resp.body).toEqual({message: "Invalid Username or Password"})
        expect(resp.status).toBe(404)
    })
    it("Can log in", async () => {
        const resp = await server.post("/auth/login").send({username: username, password: password})
        expect(resp.body).toHaveProperty("token")
        expect(resp.body).toHaveProperty("expires")
        expect(resp.body.message).toEqual("Login success")
        expect(resp.body.user).toEqual({id: 1, username: username, email: null})
        expect(resp.status).toBe(200)
    })
})