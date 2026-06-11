// vite.config.ts
import { defineConfig, loadEnv } from "file:///sessions/inspiring-upbeat-wright/mnt/Sandboxes/me-zendesk-dashboard-recurring-issues-app/frontend/node_modules/vite/dist/node/index.js";
import react from "file:///sessions/inspiring-upbeat-wright/mnt/Sandboxes/me-zendesk-dashboard-recurring-issues-app/frontend/node_modules/@vitejs/plugin-react/dist/index.js";
var vite_config_default = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const ssoUrl = env.VITE_SSO_URL ?? "https://trunk.sso.mercadoe.com";
  const realm = env.VITE_SSO_REALM ?? "zerotrust";
  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        // Proxy da API backend
        "/api": {
          target: "http://localhost:3001",
          changeOrigin: true,
          secure: false
        },
        // Proxy do token SSO: evita CORS no browser durante dev
        // O dev server faz a requisicao server-to-server, sem restricao de CORS
        "/__sso/token": {
          target: ssoUrl,
          changeOrigin: true,
          secure: true,
          rewrite: () => `/realms/${realm}/protocol/openid-connect/token`
        },
        "/__sso/logout": {
          target: ssoUrl,
          changeOrigin: true,
          secure: true,
          rewrite: () => `/realms/${realm}/protocol/openid-connect/logout`
        }
      }
    },
    build: {
      outDir: "dist",
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ["react", "react-dom"],
            charts: ["chart.js", "react-chartjs-2"],
            query: ["@tanstack/react-query"],
            store: ["zustand"]
          }
        }
      }
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvc2Vzc2lvbnMvaW5zcGlyaW5nLXVwYmVhdC13cmlnaHQvbW50L1NhbmRib3hlcy9tZS16ZW5kZXNrLWRhc2hib2FyZC1yZWN1cnJpbmctaXNzdWVzLWFwcC9mcm9udGVuZFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL3Nlc3Npb25zL2luc3BpcmluZy11cGJlYXQtd3JpZ2h0L21udC9TYW5kYm94ZXMvbWUtemVuZGVzay1kYXNoYm9hcmQtcmVjdXJyaW5nLWlzc3Vlcy1hcHAvZnJvbnRlbmQvdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL3Nlc3Npb25zL2luc3BpcmluZy11cGJlYXQtd3JpZ2h0L21udC9TYW5kYm94ZXMvbWUtemVuZGVzay1kYXNoYm9hcmQtcmVjdXJyaW5nLWlzc3Vlcy1hcHAvZnJvbnRlbmQvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcsIGxvYWRFbnYgfSBmcm9tICd2aXRlJztcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBtb2RlIH0pID0+IHtcbiAgLy8gQ2FycmVnYSBhcyB2YXJpYXZlaXMgZGUgYW1iaWVudGUgZG8gYXJxdWl2byAuZW52Ljxtb2RlPlxuICBjb25zdCBlbnYgPSBsb2FkRW52KG1vZGUsIHByb2Nlc3MuY3dkKCksICdWSVRFXycpO1xuICBjb25zdCBzc29VcmwgPSBlbnYuVklURV9TU09fVVJMID8/ICdodHRwczovL3RydW5rLnNzby5tZXJjYWRvZS5jb20nO1xuICBjb25zdCByZWFsbSAgPSBlbnYuVklURV9TU09fUkVBTE0gPz8gJ3plcm90cnVzdCc7XG5cbiAgcmV0dXJuIHtcbiAgICBwbHVnaW5zOiBbcmVhY3QoKV0sXG4gICAgc2VydmVyOiB7XG4gICAgICBwb3J0OiA1MTczLFxuICAgICAgcHJveHk6IHtcbiAgICAgICAgLy8gUHJveHkgZGEgQVBJIGJhY2tlbmRcbiAgICAgICAgJy9hcGknOiB7XG4gICAgICAgICAgdGFyZ2V0OiAnaHR0cDovL2xvY2FsaG9zdDozMDAxJyxcbiAgICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXG4gICAgICAgICAgc2VjdXJlOiBmYWxzZSxcbiAgICAgICAgfSxcbiAgICAgICAgLy8gUHJveHkgZG8gdG9rZW4gU1NPOiBldml0YSBDT1JTIG5vIGJyb3dzZXIgZHVyYW50ZSBkZXZcbiAgICAgICAgLy8gTyBkZXYgc2VydmVyIGZheiBhIHJlcXVpc2ljYW8gc2VydmVyLXRvLXNlcnZlciwgc2VtIHJlc3RyaWNhbyBkZSBDT1JTXG4gICAgICAgICcvX19zc28vdG9rZW4nOiB7XG4gICAgICAgICAgdGFyZ2V0OiBzc29VcmwsXG4gICAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxuICAgICAgICAgIHNlY3VyZTogdHJ1ZSxcbiAgICAgICAgICByZXdyaXRlOiAoKSA9PiBgL3JlYWxtcy8ke3JlYWxtfS9wcm90b2NvbC9vcGVuaWQtY29ubmVjdC90b2tlbmAsXG4gICAgICAgIH0sXG4gICAgICAgICcvX19zc28vbG9nb3V0Jzoge1xuICAgICAgICAgIHRhcmdldDogc3NvVXJsLFxuICAgICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcbiAgICAgICAgICBzZWN1cmU6IHRydWUsXG4gICAgICAgICAgcmV3cml0ZTogKCkgPT4gYC9yZWFsbXMvJHtyZWFsbX0vcHJvdG9jb2wvb3BlbmlkLWNvbm5lY3QvbG9nb3V0YCxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgICBidWlsZDoge1xuICAgICAgb3V0RGlyOiAnZGlzdCcsXG4gICAgICBzb3VyY2VtYXA6IHRydWUsXG4gICAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICAgIG91dHB1dDoge1xuICAgICAgICAgIG1hbnVhbENodW5rczoge1xuICAgICAgICAgICAgdmVuZG9yOiBbJ3JlYWN0JywgJ3JlYWN0LWRvbSddLFxuICAgICAgICAgICAgY2hhcnRzOiBbJ2NoYXJ0LmpzJywgJ3JlYWN0LWNoYXJ0anMtMiddLFxuICAgICAgICAgICAgcXVlcnk6IFsnQHRhbnN0YWNrL3JlYWN0LXF1ZXJ5J10sXG4gICAgICAgICAgICBzdG9yZTogWyd6dXN0YW5kJ10sXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfTtcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUF3ZCxTQUFTLGNBQWMsZUFBZTtBQUM5ZixPQUFPLFdBQVc7QUFFbEIsSUFBTyxzQkFBUSxhQUFhLENBQUMsRUFBRSxLQUFLLE1BQU07QUFFeEMsUUFBTSxNQUFNLFFBQVEsTUFBTSxRQUFRLElBQUksR0FBRyxPQUFPO0FBQ2hELFFBQU0sU0FBUyxJQUFJLGdCQUFnQjtBQUNuQyxRQUFNLFFBQVMsSUFBSSxrQkFBa0I7QUFFckMsU0FBTztBQUFBLElBQ0wsU0FBUyxDQUFDLE1BQU0sQ0FBQztBQUFBLElBQ2pCLFFBQVE7QUFBQSxNQUNOLE1BQU07QUFBQSxNQUNOLE9BQU87QUFBQTtBQUFBLFFBRUwsUUFBUTtBQUFBLFVBQ04sUUFBUTtBQUFBLFVBQ1IsY0FBYztBQUFBLFVBQ2QsUUFBUTtBQUFBLFFBQ1Y7QUFBQTtBQUFBO0FBQUEsUUFHQSxnQkFBZ0I7QUFBQSxVQUNkLFFBQVE7QUFBQSxVQUNSLGNBQWM7QUFBQSxVQUNkLFFBQVE7QUFBQSxVQUNSLFNBQVMsTUFBTSxXQUFXLEtBQUs7QUFBQSxRQUNqQztBQUFBLFFBQ0EsaUJBQWlCO0FBQUEsVUFDZixRQUFRO0FBQUEsVUFDUixjQUFjO0FBQUEsVUFDZCxRQUFRO0FBQUEsVUFDUixTQUFTLE1BQU0sV0FBVyxLQUFLO0FBQUEsUUFDakM7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLElBQ0EsT0FBTztBQUFBLE1BQ0wsUUFBUTtBQUFBLE1BQ1IsV0FBVztBQUFBLE1BQ1gsZUFBZTtBQUFBLFFBQ2IsUUFBUTtBQUFBLFVBQ04sY0FBYztBQUFBLFlBQ1osUUFBUSxDQUFDLFNBQVMsV0FBVztBQUFBLFlBQzdCLFFBQVEsQ0FBQyxZQUFZLGlCQUFpQjtBQUFBLFlBQ3RDLE9BQU8sQ0FBQyx1QkFBdUI7QUFBQSxZQUMvQixPQUFPLENBQUMsU0FBUztBQUFBLFVBQ25CO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
