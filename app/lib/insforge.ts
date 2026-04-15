import { createClient } from '@insforge/sdk';
import { authStorage } from './storage';

const INSFORGE_URL = process.env.NEXT_PUBLIC_INSFORGE_URL || 'https://7vxqqu38.us-east.insforge.app';
const INSFORGE_ANON_KEY = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY || '7vxqqu38';
const savedToken = authStorage.getToken();

// Configuración del cliente de InsForge
const insforge = createClient({
  baseUrl: INSFORGE_URL,
  anonKey: INSFORGE_ANON_KEY,
  headers: savedToken ? { Authorization: `Bearer ${savedToken}` } : undefined,
});

if (savedToken) {
  insforge.getHttpClient().setAuthToken(savedToken);
}

export function setInsforgeAuthToken(token: string | null) {
  insforge.getHttpClient().setAuthToken(token);
}

// Extender el cliente con manejo de errores mejorado
export const insforgeClient = {
  ...insforge,

  // Helper para obtener el token actual
  getToken: () => authStorage.getToken(),

  // Helper para verificar conexión
  healthCheck: async () => {
    try {
      const { data, error } = await insforge.database.from('boards').select('count', { count: 'exact', head: true });
      return { ok: !error, error };
    } catch (err) {
      return { ok: false, error: err };
    }
  },

  // Helper para obtener el usuario actual desde el token
  getCurrentUserFromToken: () => {
    const token = authStorage.getToken();
    if (!token) return null;

    try {
      // Decodificar el JWT (solo el payload, sin verificar firma)
      const payload = token.split('.')[1];
      if (!payload) return null;

      const decoded = JSON.parse(atob(payload));
      return decoded;
    } catch {
      return null;
    }
  },
};

export default insforge;