# ===== Deploy using Nginx =====
FROM nginx:1.25-alpine
COPY ./dist /usr/share/nginx/html
# Replace default Nginx configuration (optional)
COPY nginx.conf /etc/nginx/nginx.conf
COPY questions-party.space.pem /etc/nginx/certs/questions-party.space.pem
COPY questions-party.space.key /etc/nginx/certs/questions-party.space.key

EXPOSE 80