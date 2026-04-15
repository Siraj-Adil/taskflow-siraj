import request from "supertest";
import app from "../src/app.js";

describe("Project API (Seeded DB)", () => {
    let token;
    let projectId;

    const email = "test@example.com";
    const password = "password123";

    // LOGIN FIRST (seeded user)
    it("should login seeded user", async () => {
        const res = await request(app)
            .post("/auth/login")
            .send({ email, password });

        expect(res.statusCode).toBe(200);
        expect(res.body.token).toBeDefined();

        token = res.body.token;
    });

    // GET PROJECTS (pagination)
    it("should fetch projects list", async () => {
        const res = await request(app)
            .get("/projects?page=1&limit=10")
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.projects).toBeDefined();
        expect(Array.isArray(res.body.projects)).toBe(true);

        projectId = res.body.projects[0].id;
    });

    // NGEATIVE TEST: UNAUTHORIZED GET PROJECTS
    it("should reject request without token", async () => {
        const res = await request(app).get("/projects");

        expect(res.statusCode).toBe(401);
    });

    // GET SINGLE PROJECT
    it("should fetch project by id with tasks", async () => {
        const res = await request(app)
            .get(`/projects/${projectId}`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.project).toBeDefined();
        expect(res.body.project.tasks).toBeDefined();
    });

    // CREATE PROJECT
    it("should create new project", async () => {
        const res = await request(app)
            .post("/projects")
            .set("Authorization", `Bearer ${token}`)
            .send({
                name: "New Test Project",
                description: "Created in test",
            });

        expect(res.statusCode).toBe(201);
        expect(res.body.id).toBeDefined();

        projectId = res.body.id;
    });

    // NEGATIVE TEST: INVALID PROJECT CREATION
    it("should fail project creation with empty name", async () => {
        const res = await request(app)
            .post("/projects")
            .set("Authorization", `Bearer ${token}`)
            .send({
                name: "",
                description: "Invalid project",
            });

        expect(res.statusCode).toBe(400);
        expect(res.body.fields).toBeDefined();
    });

    // UPDATE PROJECT
    it("should update project", async () => {
        const res = await request(app)
            .patch(`/projects/${projectId}`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                name: "Updated Project Name",
                description: "Updated",
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.name).toBe("Updated Project Name");
    });

    // NEGATIVE TEST: INVALID PROJECT UPDATE
    it("should fail updating project with invalid data", async () => {
        const res = await request(app)
            .patch(`/projects/${projectId}`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                name: "",
            });

        expect(res.statusCode).toBe(400);
    });

    // GET PROJECT STATS (before project deletion)
    it("should fetch project stats", async () => {
        const res = await request(app)
            .get(`/projects/${projectId}/stats`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(200);

        expect(res.body.total_tasks).toBeDefined();
        expect(res.body.by_status).toBeDefined();
        expect(res.body.by_assignee).toBeDefined();

        expect(typeof res.body.total_tasks).toBe("number");
        expect(typeof res.body.by_status).toBe("object");
        expect(Array.isArray(res.body.by_assignee)).toBe(true);
    });

    // DELETE PROJECT
    it("should delete project", async () => {
        const res = await request(app)
            .delete(`/projects/${projectId}`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(204);
    });

    // NEGATIVE TEST: GET PROJECT STATS (after project deletion, should fail)
    it("should return 404 for stats after project deletion", async () => {
        const res = await request(app)
            .get(`/projects/${projectId}/stats`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(404);
        expect(res.body.error).toBe("project not found");
    });

});
