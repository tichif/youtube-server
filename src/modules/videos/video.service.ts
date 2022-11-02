import { VideoModel } from './video.model';

export async function createVideo({ owner }: { owner: string }) {
  return VideoModel.create({ owner });
}
