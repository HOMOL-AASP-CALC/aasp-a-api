/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_DEBIT_URL: string
    readonly VITE_CALCS_URL: string
    readonly VITE_DEBIT_LEGACY_URL: string
    readonly VITE_APP_URL: string
    readonly VITE_API_URL: string
    readonly VITE_TRAB_URL: string
    readonly VITE_ATUA_URL: string
    readonly VITE_ATUA3_URL: string
    readonly VITE_REN_URL: string
    readonly VITE_API3_URL: string
    readonly VITE_DEBIT_WWW2: string
    readonly VITE_SERVER_ATUA_API_URL: string
    readonly VITE_CALCULADORAS_URL: string
    readonly VITE_BASE_URL: string
    readonly VITE_USE_SECURE_COOKIES: string
    readonly VITE_DOMINIO: string
}

// eslint-disable-next-line no-unused-vars
interface ImportMeta {
    readonly env: ImportMetaEnv
}
