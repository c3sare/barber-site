import background, { ModeEnum } from '@react-page/plugins-background';
import divider from '@react-page/plugins-divider';
import html5video from '@react-page/plugins-html5-video';
import type { ImageUploadType } from '@react-page/plugins-image';
import { imagePlugin } from '@react-page/plugins-image';
import spacer from '@react-page/plugins-spacer';
import video from '@react-page/plugins-video';
import codeSnippet from './codeSnippet';
import slate from '@react-page/plugins-slate';

const imageUploadService: (url: string) => ImageUploadType =
  () => (file, _reportProgress) => {
    return new Promise((resolve, reject) => {
      const fd = new FormData();
      fd.append("file", file);
      fetch("/api/imageupload", {
        method: "POST",
        body: fd
      })
      .then(data => data.json())
      .then(data => resolve({url: "/images/"+data.url}))
      .catch(err => {
        reject("Error"+ err)
      })
    });
  };

export const cellPlugins = [
  slate(),
  spacer,
  imagePlugin({ imageUpload: imageUploadService('/images/vercel.svg') }),
  video,
  divider,
  html5video,
  codeSnippet,

  background({
    imageUpload: imageUploadService('/images/vercel.svg'),
    enabledModes:
      ModeEnum.COLOR_MODE_FLAG |
      ModeEnum.IMAGE_MODE_FLAG |
      ModeEnum.GRADIENT_MODE_FLAG,
  })
];