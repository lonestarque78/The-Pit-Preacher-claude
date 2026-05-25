import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.thepitpreacher.app',
  appName: 'The Pit Preacher',
  server: {
    url: 'https://thepitpreacher.com',
    cleartext: false
  }
};

export default config;
