# Sikhi Tambola created on Firebase

## Important commands

### Hosting

 1. `firebase serve` - Run current code locally - Refer to https://firebase.google.com/docs/hosting/test-preview-deploy
 1. `firebase hosting:channel:deploy release-02-210102` - Preview deploy - Refer to https://firebase.google.com/docs/hosting/test-preview-deploy

### Functions

 1. `firebase deploy --only functions:registerPrize` - To deploy a function named `registerPrize` - Refer to https://firebase.google.com/docs/functions/manage-functions

### Emulator

 1. `firebase init emulators` - To initiate emulator in your dev env - Refer to https://firebase.google.com/docs/emulator-suite/install_and_configure
 1. `firebase setup:emulators` - To setup emulator - Refer to https://firebase.google.com/docs/emulator-suite/install_and_configure
 1. `firebase emulators:start` - To start Emulator - Refer to https://firebase.google.com/docs/emulator-suite/install_and_configure
 1. `firebase emulators:start --debug` - To debug emulator run

### General

 1. `npm install -g firebase-tools` - Update Firebase
