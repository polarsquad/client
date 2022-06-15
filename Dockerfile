FROM node:18.0.0-alpine AS template_builder

COPY --chown=node ./ /app

USER node

WORKDIR /app

# Install required system packages and dependencies & build the template

RUN npm install --legacy-peer-deps && \
    npm run build -- default

# Copy Generated template to Proxy container
FROM nginx:1.21.6-alpine
# Set working directory to nginx asset directory
WORKDIR /usr/share/nginx/html
# Remove default nginx static assets
RUN rm -rf ./*
COPY --chown=nginx --from=template_builder /app/dev /usr/share/nginx/html