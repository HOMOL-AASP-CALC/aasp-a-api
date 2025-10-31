// @ts-ignore
import { fileURLToPath, URL } from 'url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
// @ts-ignore
import { version } from './package.json'

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '')

    return {
        plugins: [vue()],
        define: {
            __VERSION__: JSON.stringify(version),
        },
        resolve: {
            alias: [
                { find: '@', replacement: fileURLToPath(new URL('./src', import.meta.url)) },
            ],
        },
        server: {
            host: true,
            port: 3005,
            hmr: { port: 3005 },
            allowedHosts: env.VITE_APP_DOMAIN
                ? [env.VITE_APP_DOMAIN, 'localhost']
                : ['localhost'],
        },
    }
})
