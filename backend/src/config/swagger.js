import swaggerJSDoc from "swagger-jsdoc";

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "TaskFlow API",
            version: "1.0.0",
            description: "API documentation for TaskFlow backend",
        },
        servers: [
            {
                url:
                    process.env.APP_URL ||
                    `http://localhost:${process.env.PORT || 3000}`,
            },
        ],

        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
        },
    },

    apis: ["./src/routes/*.js"],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
