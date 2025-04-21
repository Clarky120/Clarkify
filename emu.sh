firebase use clarkify-dev
mkdir local-data
cd backend/functions && npm run build
firebase emulators:start --only functions,storage,firestore,auth,ui --import=../local-data/cloud-functions-data --export-on-exit