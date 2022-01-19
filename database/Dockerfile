FROM postgres:latest


ENV POSTGRES_USER sieke
ENV POSTGRES_PASSWORD temp
ENV POSTGRES_DB products

COPY migrate/DATA.sql /docker-entrypoint-initdb.d/



