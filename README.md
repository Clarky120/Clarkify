# Setup

**Prerequisites**

Node 22
https://github.com/nvm-sh/nvm

Angular CLI
https://angular.dev/tools/cli

Firebase CLI
https://firebase.google.com/docs/cli

Firebase emulators
https://firebase.google.com/docs/emulator-suite/install_and_configure

### Install

Install all npm packages

    sh install.sh

### Environment

Add firebase service account key at backend/core/service-keys/dev.json or core/service-keys/prod.json

Create .env file at backend/server/.env

    NODE_ENV=development
    LOG_LEVEL=debug
    FIREBASE_CREDENTIALS=../service-keys/dev.json
    FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099
    FIRESTORE_EMULATOR_HOST=127.0.0.1:8080
    FIREBASE_STORAGE_EMULATOR_HOST=127.0.0.1:9199

Create environment.ts & environment.prod.ts in frontend/apps/admin/src/environments

    export const environment = {
    	production: false,
    	firebase: {
    		projectId: 'your-project-id',
    		appId: 'your-app-id',
    		storageBucket: 'your-storage-bucket',
    		apiKey: 'your-api-key',
    		authDomain: 'your-auth-domain',
    		messagingSenderId: 'your-messaging-sender-id',
    		measurementId: 'your-measurement-id',
    	},
    	serverUrl: 'your-server-url',
    	useEmulators: true,
    	authEmulatorHost: 'your-auth-emulator-host',
    	authEmulatorPort: 9099,
    	firestoreEmulatorHost: 'your-firestore-emulator-host',
    	firestoreEmulatorPort: 8080,
    	storageEmulatorHost: 'your-storage-emulator-host',
    	storageEmulatorPort: 9199,
    };

### Run

Individual

    sh emu.sh
    sh server.sh
    cd frontend && ng serve --host 0.0.0.0

Using zellij

    sh start.sh
