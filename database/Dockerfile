FROM postgres:latest

ENV POSTGRES_USER sieke
ENV POSTGRES_PASSWORD temp
ENV POSTGRES_DB products

# docker-entrypoint-initdb.d
COPY DATA.sql /docker-entrypoint-initdb.d/

# docker buildx build --platform linux/amd64 -t asieke/db:latest --push .