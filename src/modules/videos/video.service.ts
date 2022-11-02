import { Video, VideoModel } from './video.model';

export async function createVideo({ owner }: { owner: string }) {
  return VideoModel.create({ owner });
}

export async function findVideo(videoId: Video['videoId']) {
  return await VideoModel.findOne({ videoId });
}

export async function findVideos() {
  return await VideoModel.find({ published: true }).lean();
}
