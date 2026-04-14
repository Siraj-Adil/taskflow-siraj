import request from "supertest";
import app from "../src/app.js";

describe("Full Role-Based Project Flow", () => {
    const unique = Date.now();

    const ownerEmail = `owner_${unique}@example.com`;
    const assigneeEmail = `assignee_${unique}@example.com`;
    const externalEmail = `external_${unique}@example.com`;
    const password = "password123";

    let ownerToken, assigneeToken, externalToken;
    let projectId, taskId;
    let assigneeUUID;

    // REGISTER USERS
    it("register owner", async () => {
        const res = await request(app).post("/auth/register").send({
            name: "Owner",
            email: ownerEmail,
            password,
        });

        expect(res.statusCode).toBe(201);
    });

    it("register assignee", async () => {
        const res = await request(app).post("/auth/register").send({
            name: "Assignee",
            email: assigneeEmail,
            password,
        });

        expect(res.statusCode).toBe(201);
    });

    it("register external user", async () => {
        const res = await request(app).post("/auth/register").send({
            name: "External",
            email: externalEmail,
            password,
        });

        expect(res.statusCode).toBe(201);
    });

    // LOGIN USERS
    it("login owner", async () => {
        const res = await request(app).post("/auth/login").send({
            email: ownerEmail,
            password,
        });

        expect(res.statusCode).toBe(200);
        ownerToken = res.body.token;
    });

    it("login assignee", async () => {
        const res = await request(app).post("/auth/login").send({
            email: assigneeEmail,
            password,
        });
        assigneeUUID = res.body.user.id;

        expect(res.statusCode).toBe(200);
        assigneeToken = res.body.token;
    });

    it("login external", async () => {
        const res = await request(app).post("/auth/login").send({
            email: externalEmail,
            password,
        });

        expect(res.statusCode).toBe(200);
        externalToken = res.body.token;
    });

    // OWNER CREATES PROJECT
    it("owner creates project", async () => {
        const res = await request(app)
            .post("/projects")
            .set("Authorization", `Bearer ${ownerToken}`)
            .send({
                name: "Project 101",
                description: "Project decription",
            });

        expect(res.statusCode).toBe(201);
        projectId = res.body.id;
    });

    // OWNER CREATES TASK (no assignee)
    it("owner creates task", async () => {
        const res = await request(app)
            .post(`/projects/${projectId}/tasks`)
            .set("Authorization", `Bearer ${ownerToken}`)
            .send({
                title: "Initial Task",
                priority: "low",
            });

        expect(res.statusCode).toBe(201);
        taskId = res.body.id;
    });

    // CREATE TASK Access check (before assignment, only owner can create new tasks)
    it("only owner can create task before assignment", async () => {
        const ownerRes = await request(app)
            .post(`/projects/${projectId}/tasks`)
            .set("Authorization", `Bearer ${ownerToken}`)
            .send({
                title: "Owner Task 2",
                priority: "medium",
            });

        const assigneeRes = await request(app)
            .post(`/projects/${projectId}/tasks`)
            .set("Authorization", `Bearer ${assigneeToken}`)
            .send({
                title: "Assignee Task (should fail)",
                priority: "medium",
            });

        const externalRes = await request(app)
            .post(`/projects/${projectId}/tasks`)
            .set("Authorization", `Bearer ${externalToken}`)
            .send({
                title: "External Task (should fail)",
                priority: "medium",
            });

        expect(ownerRes.statusCode).toBe(201);
        expect(assigneeRes.statusCode).toBe(403);
        expect(externalRes.statusCode).toBe(403);
    });

    // PROJECTS ACCESS CHECK (before assignment, only owner can access all projects)
    it("only owner can access project initially", async () => {
        const ownerRes = await request(app)
            .get("/projects")
            .set("Authorization", `Bearer ${ownerToken}`);

        const assigneeRes = await request(app)
            .get("/projects")
            .set("Authorization", `Bearer ${assigneeToken}`);

        const externalRes = await request(app)
            .get("/projects")
            .set("Authorization", `Bearer ${externalToken}`);

        expect(ownerRes.body.projects.length).toBeGreaterThan(0);
        expect(assigneeRes.body.projects.length).toBe(0);
        expect(externalRes.body.projects.length).toBe(0);
    });

    // PROJECT ACCESS CHECK (before assignment, only owner can access the current project)
    it("only owner can access GET /projects/:id before assignment", async () => {
        const ownerRes = await request(app)
            .get(`/projects/${projectId}`)
            .set("Authorization", `Bearer ${ownerToken}`);

        const assigneeRes = await request(app)
            .get(`/projects/${projectId}`)
            .set("Authorization", `Bearer ${assigneeToken}`);

        const externalRes = await request(app)
            .get(`/projects/${projectId}`)
            .set("Authorization", `Bearer ${externalToken}`);

        expect(ownerRes.statusCode).toBe(200);
        expect(assigneeRes.statusCode).toBe(403);
        expect(externalRes.statusCode).toBe(403);
    });

    // ASSIGN TASK TO ASSIGNEE
    it("owner assigns task to assignee", async () => {
        const res = await request(app)
            .patch(`/tasks/${taskId}`)
            .set("Authorization", `Bearer ${ownerToken}`)
            .send({
                assignee_id: assigneeUUID,
            });

        expect(res.statusCode).toBe(200);
    });

    // PROJECTS ACCESS CHECK AFTER ASSIGNMENT (Both owner & assignee can access all projects)
    it("owner and assignee can now access project", async () => {
        const ownerRes = await request(app)
            .get("/projects")
            .set("Authorization", `Bearer ${ownerToken}`);

        const assigneeRes = await request(app)
            .get("/projects")
            .set("Authorization", `Bearer ${assigneeToken}`);

        const externalRes = await request(app)
            .get("/projects")
            .set("Authorization", `Bearer ${externalToken}`);

        expect(ownerRes.body.projects.length).toBeGreaterThan(0);
        expect(assigneeRes.body.projects.length).toBeGreaterThan(0);
        expect(externalRes.body.projects.length).toBe(0);
    });

    // PROJECT ACCESS CHECK AFTER ASSIGNMENT (Both owner & assignee can access the current project)
    it("owner and assignee can access GET /projects/:id after assignment", async () => {
        const ownerRes = await request(app)
            .get(`/projects/${projectId}`)
            .set("Authorization", `Bearer ${ownerToken}`);

        const assigneeRes = await request(app)
            .get(`/projects/${projectId}`)
            .set("Authorization", `Bearer ${assigneeToken}`);

        const externalRes = await request(app)
            .get(`/projects/${projectId}`)
            .set("Authorization", `Bearer ${externalToken}`);

        expect(ownerRes.statusCode).toBe(200);
        expect(assigneeRes.statusCode).toBe(200);
        expect(externalRes.statusCode).toBe(403);
    });

    // TASK UPDATE AUTH CHECK (Both owner and assignee can update task)
    it("only owner or assignee can update task", async () => {
        const ownerRes = await request(app)
            .patch(`/tasks/${taskId}`)
            .set("Authorization", `Bearer ${ownerToken}`)
            .send({ status: "done" });

        const assigneeRes = await request(app)
            .patch(`/tasks/${taskId}`)
            .set("Authorization", `Bearer ${assigneeToken}`)
            .send({ status: "done" });

        const externalRes = await request(app)
            .patch(`/tasks/${taskId}`)
            .set("Authorization", `Bearer ${externalToken}`)
            .send({ status: "done" });

        expect(ownerRes.statusCode).toBe(200);
        expect(assigneeRes.statusCode).toBe(200);
        expect(externalRes.statusCode).toBe(403);
    });

    // UPDATE PROJECT AUTH CHECK (Only owner can update project)
    it("only owner can update project", async () => {
        const assigneeRes = await request(app)
            .patch(`/projects/${projectId}`)
            .set("Authorization", `Bearer ${assigneeToken}`)
            .send({
                name: "Updated by Assignee",
            });

        const externalRes = await request(app)
            .patch(`/projects/${projectId}`)
            .set("Authorization", `Bearer ${externalToken}`)
            .send({
                name: "Updated by External",
            });

        const ownerRes = await request(app)
            .patch(`/projects/${projectId}`)
            .set("Authorization", `Bearer ${ownerToken}`)
            .send({
                name: "Updated by Owner",
            });

        expect(assigneeRes.statusCode).toBe(403);
        expect(externalRes.statusCode).toBe(403);
        expect(ownerRes.statusCode).toBe(200);
    });

    // DELETE PROJECT AUTH CHECK (Only owner can delete project)
    it("only owner can delete project", async () => {
        const assigneeRes = await request(app)
            .delete(`/projects/${projectId}`)
            .set("Authorization", `Bearer ${assigneeToken}`);

        const externalRes = await request(app)
            .delete(`/projects/${projectId}`)
            .set("Authorization", `Bearer ${externalToken}`);

        const ownerRes = await request(app)
            .delete(`/projects/${projectId}`)
            .set("Authorization", `Bearer ${ownerToken}`);

        expect(assigneeRes.statusCode).toBe(403);
        expect(externalRes.statusCode).toBe(403);
        expect(ownerRes.statusCode).toBe(204);
    });
});
