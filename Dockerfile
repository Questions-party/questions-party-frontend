# Frontend build stage
FROM node:20 AS builder
WORKDIR /app
COPY . .

# ===== Deploy using Nginx =====
FROM nginx:1.25-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
# Replace default Nginx configuration (optional)
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80