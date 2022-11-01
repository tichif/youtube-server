import express from 'express';
import { processRequestBody } from 'zod-express-middleware';

import { loginHandler } from './auth.controller';
import { loginUserSchema } from './auth.schema';

const router = express.Router();

router.post('/', processRequestBody(loginUserSchema.body), loginHandler);

export default router;
