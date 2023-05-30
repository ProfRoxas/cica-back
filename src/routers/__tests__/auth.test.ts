import app from "../.."
import Privileges from "../../consts/privileges"
import { AppDataSource } from "../../data-source"
import { User } from "../../entity/User"
import { hashPassword, isAdmin, generateToken } from "../../utilities"

import request from "supertest"


describe("Authentication Routes", () => {
    beforeAll(async () => {
        await AppDataSource.initialize()
    })
    const token = generateToken("admin");
    const server = request(app)

    it("Can login", async () => {
        const resp = await server.post("/login").send({username: "admin", password: "admin"})
        expect(resp.body).toEqual({message: "Invalid Username or Password"})
        expect(resp.status).toBe(404)
    })
})