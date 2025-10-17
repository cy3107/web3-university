/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_WALLET_CONNECT_PROJECT_ID: string
  readonly VITE_INFURA_API_KEY: string
}

interface ProcessEnv {
  readonly VITE_WALLET_CONNECT_PROJECT_ID: string
  readonly VITE_INFURA_API_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}