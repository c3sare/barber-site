import background, { ModeEnum } from "@react-page/plugins-background";
import divider from "@react-page/plugins-divider";
import html5video from "@react-page/plugins-html5-video";
import type { ImageUploadType } from "@react-page/plugins-image";
import { imagePlugin } from "@react-page/plugins-image";
import spacer from "@react-page/plugins-spacer";
import video from "@react-page/plugins-video";
import codeSnippet from "./codeSnippet";
import slate from "@react-page/plugins-slate";

const imageUploadService: (url: string) => ImageUploadType =
  () => (file, _reportProgress) => {
    return new Promise(async (resolve, reject) => {
      const res = await fetch("/api/images", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: file.name,
          type: file.type,
        }),
      }).then((data) => data.json());

      const { url, fields } = res;

      const formData = new FormData();

      Object.entries({ ...fields, file }).forEach(([key, value]) => {
        formData.append(key, value as string);
      });

      const upload = await fetch(url, {
        method: "POST",
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
        body: formData,
      });

      if (upload.ok) {
        resolve({ url: url + file.name });
      } else {
        reject("Error");
        console.error("Upload failed.");
      }
    });
  };

const cellPlugins = [
  slate(),
  spacer,
  imagePlugin({ imageUpload: imageUploadService("/images/vercel.svg") }),
  video,
  divider,
  html5video,
  codeSnippet,

  background({
    imageUpload: imageUploadService("/images/vercel.svg"),
    enabledModes:
      ModeEnum.COLOR_MODE_FLAG |
      ModeEnum.IMAGE_MODE_FLAG |
      ModeEnum.GRADIENT_MODE_FLAG,
  }),
];

export default cellPlugins;
