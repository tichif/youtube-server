import fs from 'fs';

import busboy from 'busboy';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { Video } from './video.model';
import { createVideo } from './video.service';

const MIME_TYPES = ['video/mp4'];

function getPath({
  videoId,
  extension,
}: {
  videoId: Video['videoId'];
  extension: Video['extension'];
}) {
  return `${process.cwd()}/src/videosFiles/${videoId}.${extension}`;
}

export async function uploadVideoHandler(req: Request, res: Response) {
  const bb = busboy({ headers: req.headers });

  const user = res.locals.user;

  const video = await createVideo({ owner: user._id });

  bb.on('file', async (_, file, info) => {
    // check file mimetype
    if (!MIME_TYPES.includes(info.mimeType)) {
      return res.status(StatusCodes.BAD_REQUEST).send('Invalid file type.');
    }

    // get the file extension
    const extension = info.mimeType.split('/')[1];

    // generate path for the video
    const filePath = getPath({
      videoId: video.videoId,
      extension,
    });

    // save the video extension in the DB
    video.extension = extension;
    await video.save();

    // create stream
    const stream = fs.createWriteStream(filePath);

    file.pipe(stream);
  });

  bb.on('close', () => {
    res.writeHead(StatusCodes.CREATED, {
      Connection: 'close',
      'Content-Type': 'application/json',
    });

    res.write(JSON.stringify(video));
    res.send();
  });

  return req.pipe(bb);
}
