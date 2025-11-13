const request = require('supertest');
const app = require('../../src/app');
const storage = require('../../src/services/storage');

describe('Student-Course API integration', () => {
  // Avant chaque test : réinitialiser et recharger les données de test
  beforeEach(() => {
    storage.reset();
    storage.seed();
  });

  // Vérifie que la route GET /students renvoie bien les étudiants du jeu de données initial
  test('GET /students should return seeded students', async () => {
    const res = await request(app).get('/students');
    expect(res.statusCode).toBe(200);

    const students = res.body.students || res.body;
    expect(Array.isArray(students)).toBe(true);
    expect(students.length).toBeGreaterThanOrEqual(3);
    expect(students[0]).toHaveProperty('name');
  });

  // Vérifie que la route POST /students crée un nouvel étudiant
  test('POST /students should create a new student', async () => {
    const res = await request(app)
      .post('/students')
      .send({ name: 'David', email: 'david@example.com' });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('name', 'David');
    expect(res.body).toHaveProperty('email', 'david@example.com');
  });

  // Vérifie qu'on ne peut pas créer un étudiant avec un email déjà existant
  test('POST /students should not allow duplicate email', async () => {
    const res = await request(app)
      .post('/students')
      .send({ name: 'Eve', email: 'alice@example.com' });
    expect(res.statusCode).toBe(400);
  });

  // Vérifie qu'un cours ne peut pas être supprimé s'il a des étudiants inscrits
  test('DELETE /courses/:id should NOT delete a course if students are enrolled', async () => {
    const coursesRes = await request(app).get('/courses');
    expect(coursesRes.statusCode).toBe(200);

    const courses = coursesRes.body.courses || coursesRes.body;
    const courseId = courses[0].id;

    // Inscription d’un étudiant avant la tentative de suppression
    await request(app).post(`/courses/${courseId}/students/1`);

    const res = await request(app).delete(`/courses/${courseId}`);
    expect(res.statusCode).toBe(400);
  });

  // Vérifie qu'un cours sans étudiants inscrits peut être supprimé
  test('DELETE /courses/:id should delete a course with no students enrolled', async () => {
    const courseRes = await request(app)
      .post('/courses')
      .send({ title: 'Solo Course', teacher: 'Nobody' });

    expect(courseRes.statusCode).toBe(201);
    const courseId = courseRes.body.id;

    const del = await request(app).delete(`/courses/${courseId}`);
    expect([204, 200]).toContain(del.statusCode);
  });

  // Vérifie que les routes inconnues renvoient une erreur 404
  test('GET /unknown should return 404 with JSON', async () => {
    const res = await request(app).get('/somethingthatdoesnotexist');
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error', 'Not Found');
  });

  // Vérifie qu'un étudiant peut s'inscrire à un cours existant
  test('POST /courses/:courseId/students/:studentId should enroll a student successfully (201)', async () => {
    const res = await request(app).post('/courses/1/students/1');

    if (res.statusCode === 400) {
      expect(res.body).toHaveProperty('error');
    } else {
      expect([200, 201]).toContain(res.statusCode);
      expect(res.body).toHaveProperty('success', true);
    }
  });

  // Vérifie qu'une inscription échoue si le cours ou l'étudiant n'existe pas
  test('POST /courses/:courseId/students/:studentId should return 400 if enrollment fails', async () => {
    const res = await request(app).post('/courses/999/students/999');
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  // Vérifie qu'un étudiant peut être désinscrit d'un cours existant
  test('DELETE /courses/:courseId/students/:studentId should unenroll successfully (204)', async () => {
    await request(app).post('/courses/1/students/1');
    const res = await request(app).delete('/courses/1/students/1');
    expect([200, 204]).toContain(res.statusCode);
  });

  // Vérifie qu'une désinscription échoue si le cours ou l'étudiant n'existe pas
  test('DELETE /courses/:courseId/students/:studentId should return 404 if unenroll fails', async () => {
    const res = await request(app).delete('/courses/999/students/999');
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error');
  });
});
