import express from 'express';
import { processRequestBody } from 'zod-express-middleware';

import requireUser from '../../middleware/requireUser';
import {
  findvideosHandler,
  updateVideoHandler,
  uploadVideoHandler,
} from './video.controller';

const router = express.Router();

router.get('/', findvideosHandler);

router.post('/', requireUser, uploadVideoHandler);

router.patch('/:videoId', requireUser, updateVideoHandler);

export default router;
