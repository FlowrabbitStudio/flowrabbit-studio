# Flowrabbit

This repo contains the closed source distribution of Flowrabbit Studio.


## Main Modules

- studio: The flowrabbit studio (based on Quant-UX)
- backend: The flowrabbit backend (based on Quant-UX)

## Helper Modules

- proxy: Proxy server to access certain APIs and handle secrets
- docs: PDF and Audio processor
- apps: Responsive Viewer for flowrabbit apps (based on Luisa.could)
- websockey: Websockert server for realtime collaboration



# Deployment

Each of the modules should run on theiw on subdomain. Map you DNS entries like this:

```sh
studio.<your domain> => 8082 # Studio
apps.<your domain> => 8083 # apps
api.<your domain> => 8080 # backend
proxy.<your domain> => 8084 # proxy
websocket.<your domain> => 8086 # websocket
docs.<your domain> => 8085 # docs

```