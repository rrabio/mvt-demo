import { defineConfig } from 'vite';
import staticPlugin from 'vite-plugin-static';
import path from 'path';

export default defineConfig({
  plugins: [
    staticPlugin({
      staticDir: 'tiles',
      servePath: '/tiles'
    })
  ],
  resolve: {
    alias: {
    }
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html') // Use relative path
      }
    }
  }  
});
