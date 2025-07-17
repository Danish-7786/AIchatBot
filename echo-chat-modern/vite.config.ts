import { defineConfig,loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode,command }) => {
  const env = loadEnv(mode,process.cwd(),"")
  console.log(env.VITE_DEBUG);
  return{
  server: {
    ...(env.VITE_DEBUG === 'true' && {
    proxy: {
      "/chat": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
        secure: false,
      }
    }
  })

    
  },
  
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}});
