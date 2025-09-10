docker run -p 8080:8082 \
 -e SERVER_API_URL=https://api-qa.flowrabbit.ai \
 -e SERVER_PROXY_URL=https://proxy-qa.flowrabbit.ai \
 -e API_URL=https://api-qa.flowrabbit.ai \
 -e app_URL=https://apps-qa.flowrabbit.ai \
 -e DOMAIN_URL=https://domain-qa.flowrabbit.ai \
 -e UI_URL=https://ui-qa.flowrabbit.ai \
 -e PROXY_URL=https://proxy-qa.flowrabbit.ai \
 -e NODE_URL=https://node-qa.flowrabbit.ai \
 flowrabbit/studio