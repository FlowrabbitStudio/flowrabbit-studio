FROM maven:3-openjdk-18 AS builder

WORKDIR /app

COPY ["pom.xml", "./"]
COPY ["src/", "./src"]
RUN mvn -B package --file pom.xml



FROM amazoncorretto:21-alpine3.18 AS runner

RUN wget "https://cache.agilebits.com/dist/1P/op2/pkg/v2.30.3/op_linux_amd64_v2.30.3.zip" -O op.zip
RUN unzip -d op op.zip
RUN mv op/op /usr/local/bin/
RUN rm -r op.zip op
RUN chmod g+s /usr/local/bin/op

WORKDIR /app

COPY ["src/main/resources/emails/", "./emails"]
COPY ["flowrabbit.conf", "./"]
COPY --from=builder ["/app/build/flowrabbit.jar", "./"]

CMD [ "java", "-jar",  "flowrabbit.jar", "-Xmx2g", "-conf", "flowrabbit.conf", "-instances 1" ]