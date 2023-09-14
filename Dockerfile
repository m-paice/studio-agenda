FROM node:12.2.0-alpine as react_build 
WORKDIR /app

COPY node_modules /app/node_modules/
COPY package*.json /app/
COPY dist /app/dist/

FROM nginx:1.16.0-alpine

COPY --from=react_build /app/dist /usr/share/nginx/html
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx/nginx.conf /etc/nginx/conf.d

EXPOSE 80 
CMD ["nginx","-g","daemon off;"]

