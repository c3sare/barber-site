import { S3 } from "@aws-sdk/client-s3";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";

export default async function aws(file: File) {
  const s3 = new S3({
    region: "eu-central-1",
    apiVersion: "2012-10-17",
    credentials: {
      accessKeyId: process.env.AWS_KEY as string,
      secretAccessKey: process.env.AWS_SECRET as string,
    },
  });

  try {
    const post = await createPresignedPost(s3, {
      Bucket: process.env.S3_BUCKET_NAME as string,
      Key: file.name,
      Expires: 600,
      Fields: {
        acl: "public-read",
        "Content-Type": file.type,
      },
      Conditions: [
        ["content-length-range", 0, 5242880], //up to 5 MB
      ],
    });

    return post;
  } catch (err) {
    return err;
  }
}
