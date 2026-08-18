import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
} from '@aws-sdk/client-s3';

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucketName = process.env.R2_BUCKET_NAME || 'masar-photos';

export const isR2Configured = Boolean(
  accountId && accessKeyId && secretAccessKey && bucketName
);

let s3ClientInstance: S3Client | null = null;

export function getR2Client(): S3Client {
  if (!s3ClientInstance) {
    if (!accountId || !accessKeyId || !secretAccessKey) {
      throw new Error(
        'Cloudflare R2 is not fully configured. Missing R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, or R2_SECRET_ACCESS_KEY.'
      );
    }

    s3ClientInstance = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }
  return s3ClientInstance;
}

export function getR2BucketName(): string {
  return bucketName;
}

/**
 * Uploads a file buffer to Cloudflare R2 bucket.
 */
export async function uploadToR2(
  key: string,
  buffer: Buffer | Uint8Array,
  contentType: string = 'image/jpeg'
): Promise<void> {
  const client = getR2Client();
  const command = new PutObjectCommand({
    Bucket: getR2BucketName(),
    Key: key,
    Body: Buffer.from(buffer),
    ContentType: contentType,
  });

  await client.send(command);
}

/**
 * Retrieves a file from Cloudflare R2 bucket.
 */
export async function getFromR2(
  key: string
): Promise<{ buffer: Buffer; contentType: string } | null> {
  try {
    const client = getR2Client();
    const command = new GetObjectCommand({
      Bucket: getR2BucketName(),
      Key: key,
    });

    const response = await client.send(command);
    if (!response.Body) {
      return null;
    }

    const byteArray = await response.Body.transformToByteArray();
    const buffer = Buffer.from(byteArray);
    const contentType = response.ContentType || 'image/jpeg';

    return { buffer, contentType };
  } catch (err: any) {
    if (err?.name === 'NoSuchKey' || err?.$metadata?.httpStatusCode === 404) {
      return null;
    }
    console.error(`Error retrieving key ${key} from Cloudflare R2:`, err);
    return null;
  }
}

/**
 * Deletes a file from Cloudflare R2 bucket.
 */
export async function deleteFromR2(key: string): Promise<void> {
  try {
    const client = getR2Client();
    const command = new DeleteObjectCommand({
      Bucket: getR2BucketName(),
      Key: key,
    });
    await client.send(command);
  } catch (err) {
    console.error(`Error deleting key ${key} from Cloudflare R2:`, err);
  }
}

/**
 * Deletes multiple files from Cloudflare R2 bucket.
 */
export async function deleteManyFromR2(keys: string[]): Promise<void> {
  if (!keys || keys.length === 0) return;
  try {
    const client = getR2Client();
    const command = new DeleteObjectsCommand({
      Bucket: getR2BucketName(),
      Delete: {
        Objects: keys.map((Key) => ({ Key })),
        Quiet: true,
      },
    });
    await client.send(command);
  } catch (err) {
    console.error('Error deleting bulk keys from Cloudflare R2:', err);
  }
}
