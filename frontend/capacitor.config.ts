import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.jacinta.mzansi',
  appName: 'Mzansi',
  webDir: 'out',
  server: {
    androidScheme: 'http',
    cleartext: true,
  },
};

export default config;
