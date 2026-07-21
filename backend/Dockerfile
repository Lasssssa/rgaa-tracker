# Base image is overridable so self-hosted deployments can point at their own
# (mirrored or hardened) registry. Default reflects the current stack.
ARG PYTHON_IMAGE=python:3.12-slim

# Docker's predefined proxy build args. When passed with --build-arg, Docker
# exposes them as environment variables to every RUN step (so pip reaches the
# network through the proxy) without baking them into the final image. Leave
# them unset for a direct (no-proxy) build:
#
#   docker build \
#     --build-arg HTTP_PROXY=http://proxy.corp:8080 \
#     --build-arg HTTPS_PROXY=http://proxy.corp:8080 \
#     --build-arg NO_PROXY=localhost,127.0.0.1,.corp \
#     -f backend/Dockerfile .
ARG HTTP_PROXY
ARG HTTPS_PROXY
ARG NO_PROXY

FROM ${PYTHON_IMAGE}

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Optional: trust extra CA certificates (see certs/README.md). Drop PEM files
# named *.crt into certs/; an empty folder is a no-op. SSL_CERT_FILE and
# REQUESTS_CA_BUNDLE point Python/httpx/requests at the merged OS bundle, and
# pip-system-certs makes pip and certifi-based clients use it too.
COPY certs/ /usr/local/share/ca-certificates/
RUN update-ca-certificates -v

ENV SSL_CERT_FILE=/etc/ssl/certs/ca-certificates.crt
ENV REQUESTS_CA_BUNDLE=/etc/ssl/certs/ca-certificates.crt

RUN pip install --no-cache-dir pip-system-certs

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
