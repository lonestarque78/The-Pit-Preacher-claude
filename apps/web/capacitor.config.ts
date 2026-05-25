import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.thepitpreacher.app',
  appName: 'The Pit Preacher',
  server: {
    url: 'https://thepitpreacher.com',
    cleartext: true
  }
};

export default config;
