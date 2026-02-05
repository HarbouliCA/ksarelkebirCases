// Script to translate aid types to Arabic via API
// Run this after logging in and getting an admin token

const translations = {
  'logement': 'سكن',
  'nourriture': 'غذاء',
  'vetements': 'ملابس',
  'medicaments': 'أدوية',
  'enfants': 'أطفال',
  'autre': 'أخرى'
};

async function translateAidTypes() {
  try {
    // Login first
    console.log('🔄 Logging in...');
    const loginRes = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@ksarapp.com',
        password: 'admin123'
      })
    });

    if (!loginRes.ok) {
      throw new Error(`Login failed: ${loginRes.status}`);
    }

    const { token } = await loginRes.json();
    console.log('✅ Logged in successfully\n');

    // Get all aid types
    console.log('📋 Fetching current aid types...');
    const getRes = await fetch('http://localhost:3000/api/aid-types', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!getRes.ok) {
      throw new Error(`Get failed: ${getRes.status}`);
    }

    const { aid_types } = await getRes.json();
    console.log('Current Aid Types:');
    aid_types.forEach(at => {
      console.log(`  ${at.id}: ${at.label}`);
    });

    // Update each aid type
    console.log('\n🔄 Updating to Arabic...');
    for (const aidType of aid_types) {
      const currentLabel = aidType.label.toLowerCase();
      const arabicLabel = translations[currentLabel];

      if (arabicLabel) {
        const updateRes = await fetch(`http://localhost:3000/api/aid-types/${aidType.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ label: arabicLabel })
        });

        if (updateRes.ok) {
          console.log(`  ✅ ${currentLabel} → ${arabicLabel}`);
        } else {
          console.log(`  ❌ Failed to update ${currentLabel}`);
        }
      }
    }

    // Verify updates
    console.log('\n✅ Verification - Updated Aid Types:');
    const verifyRes = await fetch('http://localhost:3000/api/aid-types', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const { aid_types: updated } = await verifyRes.json();
    updated.forEach(at => {
      console.log(`  ${at.id}: ${at.label}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run in browser console
translateAidTypes();
