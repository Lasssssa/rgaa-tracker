# Base image is overridable so self-hosted deployments can point at their own
# (mirrored or hardened) registry. Default reflects the current stack.
ARG NODE_IMAGE=node:22-slim

# Docker's predefined proxy build args. When passed with --build-arg, Docker
# exposes them as environment variables to every RUN step (so npm reaches the
# network through the proxy) without baking them into the final image. Leave
# them unset for a direct (no-proxy) build:
#
#   docker build \
#     --build-arg HTTP_PROXY=http://proxy.corp:8080 \
#     --build-arg HTTPS_PROXY=http://proxy.corp:8080 \
#     --build-arg NO_PROXY=localhost,127.0.0.1,.corp \
#     -f frontend/Dockerfile .
ARG HTTP_PROXY
ARG HTTPS_PROXY
ARG NO_PROXY

FROM ${NODE_IMAGE}

WORKDIR /app

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]
