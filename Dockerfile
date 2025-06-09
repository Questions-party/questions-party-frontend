# ===== Deploy using Nginx =====
FROM nginx:1.25-alpine
COPY ./dist /usr/share/nginx/html
# Replace default Nginx configuration (optional)
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80