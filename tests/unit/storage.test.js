const storage = require('../../src/services/storage');

// Avant chaque test : réinitialiser le stockage et recharger les données initiales (seed)
beforeEach(() => {
  storage.reset();
  storage.seed();
});

describe('Storage Service', () => {
  // Vérifie qu'on ne peut pas créer un cours avec un titre déjà existant
  test('should NOT allow duplicate course title', () => {
    const result = storage.create('courses', {
      title: 'Math',
      teacher: 'Someone',
    });
    expect(result).toHaveProperty('error', 'Course title must be unique');
  });

  // Vérifie que la liste d’étudiants est bien chargée
  test('should list seeded students', () => {
    const students = storage.list('students');
    expect(Array.isArray(students)).toBe(true);
    expect(students.length).toBeGreaterThanOrEqual(3);
    expect(students[0]).toHaveProperty('name');
  });

  // Vérifie que la création d'un nouvel étudiant fonctionne correctement
  test('should create a new student', () => {
    const result = storage.create('students', {
      name: 'David',
      email: 'david@example.com',
    });
    expect(result).toHaveProperty('name', 'David');
    expect(storage.list('students').length).toBeGreaterThan(3);
  });

  // Vérifie qu'on ne peut pas créer un étudiant avec un email déjà utilisé
  test('should not allow duplicate student email', () => {
    const result = storage.create('students', {
      name: 'Eve',
      email: 'alice@example.com',
    });
    expect(result).toHaveProperty('error', 'Email must be unique');
  });

  // Vérifie que la suppression d'un étudiant existant fonctionne correctement
  test('should delete a student successfully', () => {
    const students = storage.list('students');
    const result = storage.remove('students', students[0].id);
    expect(result).toBe(true);
  });

  // Vérifie que la suppression d'un étudiant inexistant renvoie false
  test('should return false when deleting non-existing student', () => {
    const result = storage.remove('students', 999);
    expect(result).toBe(false);
  });

  // Vérifie que l’inscription échoue lorsque le cours est plein
  test('should prevent enrollment when course is full', () => {
    storage.reset();
    storage.seed();

    const course = storage.list('courses')[0];

    const s1 = storage.create('students', { name: 'X1', email: 'x1@example.com' });
    const s2 = storage.create('students', { name: 'X2', email: 'x2@example.com' });
    const s3 = storage.create('students', { name: 'X3', email: 'x3@example.com' });
    const s4 = storage.create('students', { name: 'X4', email: 'x4@example.com' });

    // On remplit le cours jusqu'à sa capacité
    storage.enroll(s1.id, course.id);
    storage.enroll(s2.id, course.id);
    storage.enroll(s3.id, course.id);

    // On tente d'ajouter un 4e étudiant alors que le cours est complet
    const result = storage.enroll(s4.id, course.id);
    expect(result).toHaveProperty('error', 'Course is full');
  });

  // Vérifie que les tentatives d’inscription invalides (ID inexistants) sont bien gérées
  test('should handle invalid enroll attempts gracefully', () => {
    const result = storage.enroll(999, 123);
    expect(result).toHaveProperty('error');
  });
});
