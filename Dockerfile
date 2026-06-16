FROM alpine:3.19 AS builder

ARG TARGETOS=linux
ARG TARGETARCH=amd64

RUN apk add --no-cache wget unzip

RUN wget -q "https://github.com/pocketbase/pocketbase/releases/download/v0.22.22/pocketbase_0.22.22_${TARGETOS}_${TARGETARCH}.zip" \
    -O /tmp/pb.zip && \
    unzip /tmp/pb.zip -d /tmp/ && \
    mv /tmp/pocketbase /pb

FROM alpine:3.19

RUN apk add --no-cache ca-certificates

COPY --from=builder /pb /usr/local/bin/pocketbase

EXPOSE 8090

CMD ["pocketbase", "serve", "--http=0.0.0.0:8090", "--dir=/data"]
