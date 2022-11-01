import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { findUserByEmail } from '../user/user.service';
import { signJwt } from './auth.utils';
import omit from '../../helpers/omit';
import { LoginUserType } from './auth.schema';

export async function loginHandler(
  req: Request<{}, {}, LoginUserType>,
  res: Response
) {
  const { email, password } = req.body;

  // find user by email
  const user = await findUserByEmail(email);

  if (!user) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .send('Invalid email or password');
  }
  // verify user password
  const isValid = await user.comparePassword(password);

  if (!isValid) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .send('Invalid email or password');
  }
  // sign jwt
  const payload = omit(user.toJSON(), ['password']);
  const jwt = signJwt(payload);

  // add cookie to response
  res.cookie('accessToken', jwt, {
    maxAge: 3.154e10, //1 year
    httpOnly: true,
    domain: process.env.COOKIE_DOMAIN || 'localhost',
    path: '/',
    sameSite: 'strict',
    secure: process.env.NODE_ENV !== 'production' ? false : true,
  });

  // respond
  res.status(StatusCodes.OK).send(jwt);
}
