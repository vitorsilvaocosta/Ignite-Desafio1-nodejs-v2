const app = require('./');
const swaggerUi = require('swagger-ui-express');
const swaggerFile = require('../swagger.json');
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerFile));
app.listen(3333);