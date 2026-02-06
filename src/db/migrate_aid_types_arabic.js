import '../config/env.js';
import { query, disconnectDB } from './db.js';

async function migrate() {
  try {
    console.log('🔄 Translating aid types to Arabic...');

    const translations = {
      'logement': 'سكن',
      'nourriture': 'تغذية',
      'vetements': 'ملابس',
      'medicaments': 'أدوية',
      'enfants': 'أطفال',
      'autre': 'أخرى'
    };

    for (const [french, arabic] of Object.entries(translations)) {
      console.log(`Updating ${french} -> ${arabic}...`);
      await query(
        'UPDATE aid_types SET label = $1 WHERE label = $2',
        [arabic, french]
      );
    }

    console.log('✅ Aid types translation completed');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await disconnectDB();
  }
}

migrate();
