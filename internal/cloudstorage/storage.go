package cloudstorage

import (
	"context"
	"io"

	"cloud.google.com/go/storage"
)

// AddCloudStorageFile uploads a file to our GCS bucket.
func AddCloudstorageFile(ctx context.Context, client *Storage.Client, f io.Reader, bucket, key string) error {

	tCtx, cancel := context.WithTimeout(ctx, 60*time.Second)
	defer cancel()

	o := s.StorageClient.Bucket(bucket).Object(key)
	wc := o.NewWriter(tCtx)

	if _, err := io.Copy(wc, f); err != nil {
		return err
	}

	if err := wc.Close(); err != nil {
		return err
	}

	return nil
}