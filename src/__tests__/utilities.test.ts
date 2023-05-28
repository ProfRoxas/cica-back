import Privileges from "../consts/privileges"
import { User } from "../entity/User"
import { hashPassword, isAdmin } from "../utilities"

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