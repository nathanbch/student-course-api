const storage = require('../../src/services/storage');

beforeEach(() => {
  storage.reset();
  storage.seed();
});

describe('Storage Service', () => {
  test('should NOT allow duplicate course title', () => {
    const result = storage.create('courses', {
      title: 'Math',
      teacher: 'Someone',
    });
    expect(result).toHaveProperty('error', 'Course title must be unique');
  });

  test('should list seeded students', () => {
    const students = storage.list('students');
    expect(Array.isArray(students)).toBe(true);
    expect(students.length).toBeGreaterThanOrEqual(3);
    expect(students[0]).toHaveProperty('name');
  });

  test('should create a new student', () => {
    const result = storage.create('students', {
      name: 'David',
      email: 'david@example.com',
    });
    expect(result).toHaveProperty('name', 'David');
    expect(storage.list('students').length).toBeGreaterThan(3);
  });

  test('should not allow duplicate student email', () => {
    const result = storage.create('students', {
      name: 'Eve',
      email: 'alice@example.com',
    });
    expect(result).toHaveProperty('error', 'Email must be unique');
  });

  test('should delete a student successfully', () => {
    const students = storage.list('students');
    const result = storage.remove('students', students[0].id);
    expect(result).toBe(true);
  });

  test('should return false when deleting non-existing student', () => {
    const result = storage.remove('students', 999);
    expect(result).toBe(false);
  });

  // ✅ Test corrigé ici
  test('should prevent enrollment when course is full', () => {
    storage.reset();
    storage.seed();

    const course = storage.list('courses')[0];
    const s1 = storage.create('students', {
      name: 'X1',
      email: 'x1@example.com',
    });
    const s2 = storage.create('students', {
      name: 'X2',
      email: 'x2@example.com',
    });
    const s3 = storage.create('students', {
      name: 'X3',
      email: 'x3@example.com',
    });
    const s4 = storage.create('students', {
      name: 'X4',
      email: 'x4@example.com',
    });

    storage.enroll(s1.id, course.id);
    storage.enroll(s2.id, course.id);
    storage.enroll(s3.id, course.id);

    const result = storage.enroll(s4.id, course.id);
    expect(result).toHaveProperty('error', 'Course is full');
  });

  test('should handle invalid enroll attempts gracefully', () => {
    const result = storage.enroll(999, 123);
    expect(result).toHaveProperty('error');
  });
});
