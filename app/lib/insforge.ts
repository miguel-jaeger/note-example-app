import { createClient } from '@insforge/sdk';

const insforge = createClient({
  baseUrl: 'https://backendapp-7vxqqu38.us-east.insforge.app',
  anonKey: '7vxqqu38',
});

export default insforge;