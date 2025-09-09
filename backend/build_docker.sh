#docker build -t flowrabbit/backend:latest .
#docker push flowrabbit/backend:latest
docker buildx build --platform linux/amd64 -t flowrabbit/backend:latest --push .