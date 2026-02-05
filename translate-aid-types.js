import { query } from './src/db/db.js';
import dotenv from 'dotenv';

dotenv.config();

async function translateAidTypes() {
  try {
    console.log('🔄 Connecting to database...');
    
    // Get current aid types
    const current = await query('SELECT id, label FROM aid_types ORDER BY id');
    console.log('\n📋 Current Aid Types:');
    current.rows.forEach(row => {
      console.log(`  ${row.id}: ${row.label}`);
    });
    
    // Translation mapping
    const translations = {
      'logement': 'سكن',
      'nourriture': 'غذاء',
      'vetements': 'ملابس',
      'medicaments': 'أدوية',
      'enfants': 'أطفال',
      'autre': 'أخرى'
    };
    
    // Update each aid type
    console.log('\n🔄 Updating to Arabic...');
    for (const [oldLabel, newLabel] of Object.entries(translations)) {
      const result = await query(
        'UPDATE aid_types SET label = $1 WHERE LOWER(label) = $2 RETURNING id, label',
        [newLabel, oldLabel.toLowerCase()]
      );
      if (result.rows.length > 0) {
        console.log(`  ✅ ${oldLabel} → ${newLabel}`);
      } else {
        console.log(`  ⚠️  ${oldLabel} not found`);
      }
    }
    
    // Verify updates
    const updated = await query('SELECT id, label FROM aid_types ORDER BY id');
    console.log('\n✅ Updated Aid Types:');
    updated.rows.forEach(row => {
      console.log(`  ${row.id}: ${row.label}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

translateAidTypes();
