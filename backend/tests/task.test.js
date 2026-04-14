import request from "supertest";
import app from "../src/app.js";

describe("Task API (Seeded DB)", () => {
    let token;
    let projectId;
    let taskId;

    const email = "test@example.com";
    const password = "password123";

    // LOGIN
    it("should login user", async () => {
        const res = await request(app)
            .post("/auth/login")
            .send({ email, password });

        expect(res.statusCode).toBe(200);
        expect(res.body.token).toBeDefined();

        token = res.body.token;
    });

    // GET PROJECTS to get projectId
    it("should fetch projects and get projectId", async () => {
        const res = await request(app)
            .get("/projects?page=1&limit=10")
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.projects.length).toBeGreaterThan(0);

        projectId = res.body.projects[0].id;
    });

    // GET TASKS
    it("should fetch tasks for project", async () => {
        const res = await request(app)
            .get(`/projects/${projectId}/tasks`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.tasks).toBeDefined();
        expect(Array.isArray(res.body.tasks)).toBe(true);
    });

    // NEGATIVE TEST: GET TASKS FOR INVALID PROJECT
    it("should return 404 for invalid project", async () => {
        const res = await request(app)
            .get("/projects/invalid-id/tasks")
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(404);
    });

    // CREATE TASK
    it("should create a task", async () => {
        const res = await request(app)
            .post(`/projects/${projectId}/tasks`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                title: "Test Task",
                description: "Created via test",
                priority: "high",
            });

        expect(res.statusCode).toBe(201);
        expect(res.body.id).toBeDefined();

        taskId = res.body.id;
    });

    // NEGATIVE TEST: CREATE TASK WITHOUT TOKEN
    it("should reject task creation without auth", async () => {
        const res = await request(app)
            .post(`/projects/${projectId}/tasks`)
            .send({
                title: "No Auth Task",
            });

        expect(res.statusCode).toBe(401);
    });

    // NEGATIVE TEST: CREATE TASK WITH EMPTY TITLE
    it("should fail task creation with empty title", async () => {
        const res = await request(app)
            .post(`/projects/${projectId}/tasks`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                title: "",
            });

        expect(res.statusCode).toBe(400);
        expect(res.body.fields).toBeDefined();
    });

    // UPDATE TASK
    it("should update task", async () => {
        const res = await request(app)
            .patch(`/tasks/${taskId}`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                title: "Updated Task Title",
                status: "done",
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.title).toBe("Updated Task Title");
    });

    // NEGATIVE TEST: UPDATE TASK WITHOUT TOKEN
    it("should reject task update without token", async () => {
        const res = await request(app).patch(`/tasks/${taskId}`).send({
            title: "Hacked Update",
        });

        expect(res.statusCode).toBe(401);
    });

    // NEGATIVE TEST: INVALID TASK UPDATE
    it("should fail update with invalid status", async () => {
        const res = await request(app)
            .patch(`/tasks/${taskId}`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                status: "invalid_status",
            });

        expect(res.statusCode).toBe(400);
    });

    // DELETE TASK
    it("should delete task", async () => {
        const res = await request(app)
            .delete(`/tasks/${taskId}`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(204);
    });

    // NEGATIVE TEST: DELETE TASK WITHOUT TOKEN
    it("should reject delete without auth", async () => {
        const res = await request(app).delete(`/tasks/${taskId}`);

        expect(res.statusCode).toBe(401);
    });
});
