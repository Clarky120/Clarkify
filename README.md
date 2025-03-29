# Setup

**Prerequisites**

Node 22
https://github.com/nvm-sh/nvm

Firebase CLI
https://firebase.google.com/docs/cli

Firebase emulators
https://firebase.google.com/docs/emulator-suite/install_and_configure

### Install

Install all npm packages

    sh install.sh

### Environment

Create .env file at bff/.env

    PORT=3000
    NODE_ENV=development
    LOG_LEVEL=debug

Create environment.ts & environment.prod.ts in admin/src/environments

    export  const  environment  = {
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
    	bffUrl: 'your-bff-url',
    };

### Run

Individual

    sh emu.sh
    sh bff.sh
    cd admin && ng serve --host 0.0.0.0

Using tmux

    sh tmux.sh
