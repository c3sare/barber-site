import { ListObjectsV2Command, S3Client } from "@aws-sdk/client-s3";

export default async function awsGetImages() {
  const s3 = new S3Client({
    region: "eu-central-1",
    apiVersion: "2012-10-17",
    credentials: {
      accessKeyId: process.env.AWS_KEY as string,
      secretAccessKey: process.env.AWS_SECRET as string,
    },
  });

  const command = new ListObjectsV2Command({
    Bucket: process.env.S3_BUCKET_NAME as string,
  });

  try {
    let isTruncated = true;
    let contents: any[] = [];

    while (isTruncated) {
      const { Contents, IsTruncated, NextContinuationToken } = await s3.send(
        command
      );
      if (Contents instanceof Array) contents = [...contents, ...Contents];

      isTruncated = Boolean(IsTruncated);
      command.input.ContinuationToken = NextContinuationToken;
    }

    return contents;
  } catch (err) {
    return err;
  }
}
