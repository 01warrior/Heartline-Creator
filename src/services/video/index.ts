import { IVideoProvider, VideoProviderType } from './types';
import { AgnesVideoProvider } from './AgnesVideoProvider';
import { VeoVideoProvider } from './VeoVideoProvider';

export * from './types';
export * from './AgnesVideoProvider';
export * from './VeoVideoProvider';

const agnesProviderInstance = new AgnesVideoProvider();
const veoProviderInstance = new VeoVideoProvider();

export function getVideoProvider(type: VideoProviderType): IVideoProvider {
  switch (type) {
    case 'agnes':
      return agnesProviderInstance;
    case 'veo':
    default:
      return veoProviderInstance;
  }
}
