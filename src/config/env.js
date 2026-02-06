import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '../../');

// Load default .env
dotenv.config({ path: path.join(rootDir, '.env') });

// Load .env.production if in production mode
if (process.env.NODE_ENV === 'production') {
  console.log('📝 Loading production environment configuration...');
  const result = dotenv.config({ path: path.join(rootDir, '.env.production') });
  
  if (result.error) {
    console.log('⚠️  .env.production file not found. Ensure environment variables are set in your deployment platform.');
  } else {
    console.log('✅ Loaded .env.production');
  }
}
