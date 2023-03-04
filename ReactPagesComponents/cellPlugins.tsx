import background, { ModeEnum } from '@react-page/plugins-background';
import divider from '@react-page/plugins-divider';
import html5video from '@react-page/plugins-html5-video';
import type { ImageUploadType } from '@react-page/plugins-image';
import { imagePlugin } from '@react-page/plugins-image';
import spacer from '@react-page/plugins-spacer';
import video from '@react-page/plugins-video';
import codeSnippet from './codeSnippet';
import slate from '@react-page/plugins-slate';

const fakeImageUploadService: (url: string) => ImageUploadType =
  (defaultUrl) => (file, reportProgress) => {
    return new Promise((resolve, reject) => {
      let counter = 0;
      const interval = setInterval(() => {
        counter++;
        reportProgress(counter * 10);
        if (counter > 9) {
          clearInterval(interval);
          alert(
            'Image has not actually been uploaded to a server. Check documentation for information on how to provide your own upload function.'
          );
          resolve({ url: URL.createObjectURL(file) });
        }
      }, 100);
    });
  };

// Define which plugins we want to use.

export const cellPlugins = [
  slate(),
  spacer,
  imagePlugin({ imageUpload: fakeImageUploadService('/images/react.png') }),
  video,
  divider,
  html5video,
  codeSnippet,

  background({
    imageUpload: fakeImageUploadService('/images/sea-bg.jpg'),
    enabledModes:
      ModeEnum.COLOR_MODE_FLAG |
      ModeEnum.IMAGE_MODE_FLAG |
      ModeEnum.GRADIENT_MODE_FLAG,
  })
];