import fs from 'fs';

import busboy from 'busboy';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { Video } from './video.model';
import { createVideo, findVideo, findVideos } from './video.service';
import { UpdateVideoBody, UpdateVideoParams } from './video.schema';

const MIME_TYPES = ['video/mp4'];
const CHUNK_SIZE_IN_BYTES = 1000000; //1 MB

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

export async function updateVideoHandler(
  req: Request<UpdateVideoParams, {}, UpdateVideoBody>,
  res: Response
) {
  const { videoId } = req.params;

  const { title, description, published } = req.body;

  const { _id: userId } = res.locals.user;

  const video = await findVideo(videoId);

  if (!video) {
    return res.status(StatusCodes.NOT_FOUND).send('Video not found');
  }

  if (video.owner?.toString() !== userId) {
    return res.status(StatusCodes.UNAUTHORIZED).send('Unauthorized');
  }

  video.title = title;
  video.description = description;
  video.published = published;
  await video.save();

  return res.status(StatusCodes.OK).send(video);
}

export async function findvideosHandler(req: Request, res: Response) {
  const videos = await findVideos();

  return res.status(StatusCodes.OK).send(videos);
}

export async function streamVideoHandler(req: Request, res: Response) {
  const { videoId } = req.params;

  const range = req.headers.range;

  if (!range) {
    return res.status(StatusCodes.BAD_REQUEST).send('range must be provided');
  }

  const video = await findVideo(videoId);

  if (!video) {
    return res.status(StatusCodes.NOT_FOUND).send('Video not found');
  }

  const filePath = getPath({ videoId, extension: video.extension });

  const fileSizeInBytes = fs.statSync(filePath).size;

  const chunkStart = Number(range.replace(/\D/g, ''));
  const chunkEnd = Math.min(
    chunkStart + CHUNK_SIZE_IN_BYTES,
    fileSizeInBytes - 1
  );

  const contentLength = chunkEnd - chunkStart + 1;

  const headers = {
    'Content-Range': `bytes ${chunkStart}-${chunkEnd}/${fileSizeInBytes}`,
    'Accept-ranges': 'bytes',
    'Content-Length': contentLength,
    'Content-Type': `video/${video.extension}`,
    // "Cross-Origin-resource-Policy": "cross-origin"
  };

  res.writeHead(StatusCodes.PARTIAL_CONTENT, headers);

  const videoStreamn = fs.createReadStream(filePath, {
    start: chunkStart,
    end: chunkEnd,
  });

  videoStreamn.pipe(res);
}
