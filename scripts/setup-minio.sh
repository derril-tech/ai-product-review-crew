#!/bin/bash
# Created automatically by Cursor AI (2024-12-19)

# Wait for MinIO to be ready
echo "Waiting for MinIO to be ready..."
sleep 10

# Configure MinIO client
mc alias set local http://minio:9000 minioadmin minioadmin

# Create buckets
echo "Creating MinIO buckets..."
mc mb local/product-review-crew
mc mb local/product-review-crew-snapshots
mc mb local/product-review-crew-exports
mc mb local/product-review-crew-logs

# Set bucket policies
echo "Setting bucket policies..."
mc policy set public local/product-review-crew
mc policy set public local/product-review-crew-snapshots
mc policy set public local/product-review-crew-exports
mc policy set public local/product-review-crew-logs

echo "MinIO setup completed!"
