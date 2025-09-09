# Flowrabbit-Backend

## Idea Setup

```
cd Docuemnts/Tools/mongo/bin
./mongod --dbpath ../data
```

or

```shell
docker run -p 27017:27017 --name quxmongo2 -d mongo:4.4  
```

Configure in Eclipse

Main Class: io.vertx.core.Starter

Program Arguments: run matc.ai.flowrabbit.Main -conf matc.conf

VM Arguments: -Dvertx.disableFileCaching=true


# Docker

Open Shell in container

```sh
docker run --rm -it --entrypoint sh flowrabbit/backend
```

