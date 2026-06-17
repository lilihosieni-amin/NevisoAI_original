import imageCompression from 'browser-image-compression';
import { getApolloClient } from './apollo-client';
import { REQUEST_FOLDER_COVER_UPLOAD } from './graphql/folders';

/** PUT a body to a presigned URL via XHR so upload progress can be reported. */
function putWithProgress(
  url: string,
  body: Blob,
  contentType: string,
  onProgress?: (percent: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', url);
    xhr.setRequestHeader('Content-Type', contentType);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`cover upload failed (${xhr.status})`));
    };
    xhr.onerror = () => reject(new Error('cover upload failed'));
    xhr.send(body);
  });
}

/**
 * Compress a chosen cover image client-side, request a presigned PUT, upload it
 * directly to Arvan, and return the stored object key (to send as `coverUrl`).
 * Forces JPEG so the format is always one the server accepts (HEIC phone photos
 * are transcoded here rather than uploaded as-is for a thumbnail).
 *
 * `onProgress` reports the upload percentage (0–100) during the PUT.
 */
export async function uploadFolderCover(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<string> {
  // Covers render small (~110px tall in a quarter-width card), so a 640px / ~0.3MB
  // JPEG is plenty and uploads/downloads much faster than a full-size photo.
  const compressed = await imageCompression(file, {
    maxSizeMB: 0.3,
    maxWidthOrHeight: 640,
    useWebWorker: true,
    fileType: 'image/jpeg',
  });

  const client = getApolloClient();
  const { data } = await client.mutate({
    mutation: REQUEST_FOLDER_COVER_UPLOAD,
    variables: { contentType: 'image/jpeg', contentLength: compressed.size },
  });
  const { uploadUrl, objectKey } = data.requestFolderCoverUpload;

  await putWithProgress(uploadUrl, compressed, 'image/jpeg', onProgress);

  return objectKey as string;
}
