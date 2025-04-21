#!/bin/bash

cd backend

cd core
npm install
npm run build
cd ..

cd server
npm install
npm run build
cd ..

cd functions
npm install
npm run build

cd ../frontend

cd admin
npm install
cd ..