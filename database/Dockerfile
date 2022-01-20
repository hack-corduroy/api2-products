FROM postgres:latest

ENV POSTGRES_USER sieke
ENV POSTGRES_PASSWORD temp
ENV POSTGRES_DB products

# docker-entrypoint-initdb.d
COPY migrate/DATA.tar.gz /docker-entrypoint-initdb.d/
COPY migrate/initialize_docker.sh /docker-entrypoint-initdb.d/


