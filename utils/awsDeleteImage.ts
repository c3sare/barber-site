import { S3 } from "@aws-sdk/client-s3";

export default async function awsDeleteImage(name: string) {
  const s3 = new S3({
    region: "eu-central-1",
    apiVersion: "2012-10-17",
    credentials: {
      accessKeyId: process.env.AWS_KEY as string,
      secretAccessKey: process.env.AWS_SECRET as string,
    },
  });

  try {
    const post = await s3.deleteObject({
      Bucket: process.env.S3_BUCKET_NAME as string,
      Key: name,
    });

    return post;
  } catch (err) {
    return err;
  }
}
