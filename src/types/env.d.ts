/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_APP_PASSWORD: string
	// 他の環境変数を定義
}

interface ImportMeta {
	readonly env: ImportMetaEnv
}
