import {defineConfig} from 'vitest/config'

export default defineConfig({
        test: {
            globals: true,
            environment: "jsdom",
            setupFiles: ['./vitest.setup.ts'],
        },
        resolve: {
            conditions: ['development', 'browser'],
            extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
        }
    }
)