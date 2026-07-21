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

# Optional: trust extra CA certificates (see certs/README.md). Drop PEM files
# named *.crt into certs/; an empty folder is a no-op. update-ca-certificates
# merges them into the OS bundle and NODE_EXTRA_CA_CERTS makes node and npm
# trust it — e.g. to install from a registry behind a TLS-intercepting proxy.
# node:slim (Debian) ships without the ca-certificates package, so install it
# first — unlike python:slim, which already includes it.
RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates \
    && rm -rf /var/lib/apt/lists/*
COPY certs/ /usr/local/share/ca-certificates/
RUN update-ca-certificates -v

ENV NODE_EXTRA_CA_CERTS=/etc/ssl/certs/ca-certificates.crt

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]
