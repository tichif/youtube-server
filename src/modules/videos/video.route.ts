import express from 'express';

import requireUser from '../../middleware/requireUser';
import { uploadVideoHandler } from './video.controller';

const router = express.Router();

router.post('/', requireUser, uploadVideoHandler);

export default router;
