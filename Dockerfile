FROM node:22-alpine

LABEL org.opencontainers.image.title="mcp-vadyu" \
      org.opencontainers.image.description="Official MCP server for Vadyu 2.0 AI Commercial Video Ad Studio" \
      org.opencontainers.image.url="https://vadyu.com/api-docs#mcp" \
      org.opencontainers.image.source="https://github.com/crawde/mcp-vadyu" \
      org.opencontainers.image.version="2.0.0" \
      org.opencontainers.image.licenses="MIT"

WORKDIR /app
COPY package.json vadyu-mcp.mjs ./
RUN chmod +x /app/vadyu-mcp.mjs

USER node
ENTRYPOINT ["node", "/app/vadyu-mcp.mjs"]
