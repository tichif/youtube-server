import express from 'express';
import { processRequestBody } from 'zod-express-middleware';
import requireUser from '../../middleware/requireUser';

import { getCurrentUserHandler, registerUserHandler } from './user.controller';
import { registerUserSchema } from './user.schema';

const router = express.Router();

router.get('/', requireUser, getCurrentUserHandler);

router.post(
  '/',
  processRequestBody(registerUserSchema.body),
  registerUserHandler
);

export default router;
