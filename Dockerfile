FROM node:16

# Create app directory and epgpub directory
WORKDIR /home/node/ATL
COPY ATL /home/node/ATL
# Install app dependencies
RUN npm install

EXPOSE 9101

CMD npm start