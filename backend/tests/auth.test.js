import request from "supertest";
import app from "../src/app.js";
import prisma from "../src/config/db.js";

describe("Auth API", () => {
    const email = `test_${Date.now()}@example.com`;
    const password = "password123";
    let userId;
    
    // LOGIN TEST (Seeded user)
    it("should login user", async () => {
        const res = await request(app).post("/auth/login").send({
            email: "test@example.com",
            password,
        });

        expect(res.statusCode).toBe(200);
        expect(res.body.token).toBeDefined();
        expect(res.body.user.email).toBe("test@example.com");
    });

    // REGISTER TEST
    it("should register a user", async () => {
        const res = await request(app).post("/auth/register").send({
            name: "Test User",
            email,
            password,
        });

        expect(res.statusCode).toBe(201);
        expect(res.body.token).toBeDefined();
        expect(res.body.user).toBeDefined();
        expect(res.body.user.email).toBe(email);

        userId = res.body.user.id;
    });

    // LOGIN TEST
    it("should login user", async () => {
        const res = await request(app).post("/auth/login").send({
            email,
            password,
        });

        expect(res.statusCode).toBe(200);
        expect(res.body.token).toBeDefined();
        expect(res.body.user.email).toBe(email);
    });


    // NEGATIVE TEST: WRONG PASSWORD
    it("should fail login with wrong password", async () => {
        const res = await request(app).post("/auth/login").send({
            email,
            password: "wrongpassword",
        });

        expect(res.statusCode).toBe(401);
    });

    // NEGATIVE TEST: DUPLICATE REGISTRATION
    it("should fail registration with duplicate email", async () => {
        const res = await request(app).post("/auth/register").send({
            name: "Duplicate User",
            email,
            password: "password123",
        });

        expect(res.statusCode).toBe(409);
        expect(res.body.error).toBeDefined();
    });

    // NEGATIVE TEST: INVALID EMAIL FORMAT
    it("should fail registration with invalid email", async () => {
        const res = await request(app).post("/auth/register").send({
            name: "Bad User",
            email: "invalid-email",
            password: "password123",
        });

        expect(res.statusCode).toBe(400);
        expect(res.body.fields).toBeDefined();
    });
});
