FROM node:18

WORKDIR /apps/ddmbot

COPY . .

COPY package* .

RUN npm install

CMD ["npm", "run", "ddmbot-prod"]




