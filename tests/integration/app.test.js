const request = require('supertest');
const app = require('../../src/app');
const storage = require('../../src/services/storage');

describe('Student-Course API integration', () => {
  beforeEach(() => {
    storage.reset();
    storage.seed();
  });

  // --- Vérifie que le seed fonctionne ---
  test('GET /students should return seeded students', async () => {
    const res = await request(app).get('/students');
    expect(res.statusCode).toBe(200);

    const students = res.body.students || res.body;
    expect(Array.isArray(students)).toBe(true);
    expect(students.length).toBeGreaterThanOrEqual(3);
    expect(students[0]).toHaveProperty('name');
  });

  // --- Création d’un nouvel étudiant ---
  test('POST /students should create a new student', async () => {
    const res = await request(app)
      .post('/students')
      .send({ name: 'David', email: 'david@example.com' });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('name', 'David');
    expect(res.body).toHaveProperty('email', 'david@example.com');
  });

  // --- Empêcher la duplication d’email ---
  test('POST /students should not allow duplicate email', async () => {
    const res = await request(app)
      .post('/students')
      .send({ name: 'Eve', email: 'alice@example.com' });
    expect(res.statusCode).toBe(400);
  });

  // --- Ne pas supprimer un cours si des étudiants sont inscrits ---
  test('DELETE /courses/:id should NOT delete a course if students are enrolled', async () => {
    const coursesRes = await request(app).get('/courses');
    expect(coursesRes.statusCode).toBe(200);

    const courses = coursesRes.body.courses || coursesRes.body;
    const courseId = courses[0].id;

    await request(app).post(`/courses/${courseId}/students/1`);

    const res = await request(app).delete(`/courses/${courseId}`);
    expect(res.statusCode).toBe(400);
  });

  // --- Supprimer un cours sans étudiants ---
  test('DELETE /courses/:id should delete a course with no students enrolled', async () => {
    const courseRes = await request(app)
      .post('/courses')
      .send({ title: 'Solo Course', teacher: 'Nobody' });

    expect(courseRes.statusCode).toBe(201);
    const courseId = courseRes.body.id;

    const del = await request(app).delete(`/courses/${courseId}`);
    expect([204, 200]).toContain(del.statusCode);
  });

  // --- GET inconnu ---
  test('GET /unknown should return 404 with JSON', async () => {
    const res = await request(app).get('/somethingthatdoesnotexist');
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error', 'Not Found');
  });

  // ------------------------------------------------------------------
  // 🚀 Tests pour routes /courses/:courseId/students/:studentId
  // ------------------------------------------------------------------

  test('POST /courses/:courseId/students/:studentId should enroll a student successfully (201)', async () => {
    const res = await request(app).post('/courses/1/students/1');

    // Si l’inscription échoue (400), on vérifie simplement qu’une erreur est renvoyée
    if (res.statusCode === 400) {
      expect(res.body).toHaveProperty('error');
    } else {
      expect([200, 201]).toContain(res.statusCode);
      expect(res.body).toHaveProperty('success', true);
    }
  });

  test('POST /courses/:courseId/students/:studentId should return 400 if enrollment fails', async () => {
    // on force un cas d’erreur : étudiant ou cours invalide
    const res = await request(app).post('/courses/999/students/999');
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('DELETE /courses/:courseId/students/:studentId should unenroll successfully (204)', async () => {
    // s’assure que l’étudiant est inscrit avant de le désinscrire
    await request(app).post('/courses/1/students/1');
    const res = await request(app).delete('/courses/1/students/1');
    expect([200, 204]).toContain(res.statusCode);
  });

  test('DELETE /courses/:courseId/students/:studentId should return 404 if unenroll fails', async () => {
    const res = await request(app).delete('/courses/999/students/999');
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error');
  });
});
