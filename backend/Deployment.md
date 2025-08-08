# pull latest code, rebuild, restart
git pull
docker build -t fruit-ninja-backend:latest .
docker rm -f fruit-ninja && \
docker run -d --name fruit-ninja --restart unless-stopped -p 80:3000 -e NODE_ENV=production -e PORT=3000 fruit-ninja-backend:latest

docker logs -f fruit-ninja