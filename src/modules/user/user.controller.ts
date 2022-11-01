import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';

import { createUser } from './user.service';
import { RegisterUserType } from './user.schema';

export async function registerUserHandler(
  req: Request<{}, {}, RegisterUserType>,
  res: Response,
  next: NextFunction
) {
  const { username, email, password } = req.body;
  try {
    await createUser({ username, email, password });

    return res.status(StatusCodes.CREATED).send('User created successfully.');
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(StatusCodes.CONFLICT).send('user already exist');
    }
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error.message);
  }
}
