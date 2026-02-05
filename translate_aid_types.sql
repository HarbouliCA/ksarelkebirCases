-- Translate aid types to Arabic
UPDATE aid_types SET label = 'سكن' WHERE LOWER(label) = 'logement';
UPDATE aid_types SET label = 'غذاء' WHERE LOWER(label) = 'nourriture';
UPDATE aid_types SET label = 'ملابس' WHERE LOWER(label) = 'vetements';
UPDATE aid_types SET label = 'أدوية' WHERE LOWER(label) = 'medicaments';
UPDATE aid_types SET label = 'أطفال' WHERE LOWER(label) = 'enfants';
UPDATE aid_types SET label = 'أخرى' WHERE LOWER(label) = 'autre';

-- Verify the updates
SELECT id, label FROM aid_types ORDER BY id;
