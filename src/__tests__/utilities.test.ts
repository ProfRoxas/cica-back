import app from ".."
import Privileges from "../consts/privileges"
import { AppDataSource } from "../data-source"
import { User } from "../entity/User"
import { hashPassword, isAdmin, generateToken } from "../utilities"

import request from "supertest"

describe("Password Hashing", () => {
    const password1 = "RandomPass"
    const password2 = "RandomPasS"
    
    it("Has password return a hash", async () => {
        const hash1 = hashPassword(password1)

        expect(hash1).toBeTruthy()
        expect(hash1).not.toEqual(password1)
    })
    it("hash is same for the same input", async () => {
        const hash1 = hashPassword(password1)
        const hash2 = hashPassword(password1)

        expect(hash1).toEqual(hash2)
    })
    it("hash different for different input", async () => {
        const hash1 = hashPassword(password1)
        const hash2 = hashPassword(password2)

        expect(hash1).not.toEqual(hash2)
    })
})

describe("Admin check", () => {
    const user = new User()
    it("User is not Admin", async () => {
        user.privilege = Privileges.USER
        expect(isAdmin(user)).not.toBe(true)
    })
    it("Admin is Admin", async () => {
        user.privilege = Privileges.ADMIN
        expect(isAdmin(user)).toBe(true)
    })
    it("Owner is Admin", async () => {
        user.privilege = Privileges.OWNER
        expect(isAdmin(user)).toBe(true)
    })
})

describe("Authentication check Test", () => {
    const token = generateToken("admin");
    const server = request(app)
    beforeAll(async () => {
        AppDataSource.setOptions({database: ":memory:", synchronize: true})
        await AppDataSource.initialize()
        await AppDataSource.getRepository(User).save({username: "admin", password: "admin"})
    })

    it("Missing Token", async () => {
        const resp = await server.get("/users")
        expect(resp.body).toEqual({message: "Missing Authorization Token"})
        expect(resp.status).toBe(401)
    })
    it("Wrong Token text", async () => {
        const resp = await server.get("/users").set({authorization: `Token ${token}`})
        expect(resp.body).toEqual({message: "Missing Authorization Token"})
        expect(resp.status).toBe(401)
    })
    it("Invalid Token", async () => {
        const resp = await server.get("/users").set({authorization: `Bearer ${token}1`})
        expect(resp.body).toEqual({message: "Invalid Authorization Token"})
        expect(resp.status).toBe(403)
    })
    it("Accepted Token", async () => {
        const resp = await server.get("/users").set({authorization: `Bearer ${generateToken("admin")}`})
        expect(resp.body).toHaveProperty("count")
        expect(resp.body).toHaveProperty("results")
        expect(resp.status).toBe(200)
    })

})