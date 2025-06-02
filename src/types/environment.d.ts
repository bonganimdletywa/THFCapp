/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_ZOHO_API_BASE: string;
  readonly VITE_ZOHO_REFRESH_TOKEN: string;
  readonly VITE_ZOHO_CLIENT_ID: string;
  readonly VITE_ZOHO_CLIENT_SECRET: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*.tsx' {
  const component: any;
  export default component;
}

declare module '*.ts' {
  const content: any;
  export default content;
} 