const storage = require('../services/storage');

/**
 * @swagger
 * /courses:
 *   get:
 *     summary: Liste des cours
 *     responses:
 *       200:
 *         description: OK
 */
exports.listCourses = (req, res) => {
  let courses = storage.list('courses');
  const { title, teacher, page = 1, limit = 10 } = req.query;
  if (title) courses = courses.filter((c) => c.title.includes(title));
  if (teacher) courses = courses.filter((c) => c.teacher.includes(teacher));
  const start = (page - 1) * limit;
  const paginated = courses.slice(start, start + Number(limit));
  res.json({ courses: paginated, total: courses.length });
};

/**
 * @swagger
 * /courses/{id}:
 *   get:
 *     summary: Récupérer un cours
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: OK
 *       404:
 *         description: Non trouvé
 */
exports.getCourse = (req, res) => {
  const course = storage.get('courses', req.params.id);
  if (!course) return res.status(404).json({ error: 'Course not found' });
  const students = storage.getCourseStudents(req.params.id);
  return res.json({ course, students });
};

/**
 * @swagger
 * /courses:
 *   post:
 *     summary: Créer un cours
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               teacher:
 *                 type: string
 *             required:
 *               - title
 *               - teacher
 *     responses:
 *       201:
 *         description: Créé
 *       400:
 *         description: Paramètres invalides
 */
exports.createCourse = (req, res) => {
  const { title, teacher } = req.body;
  if (!title || !teacher) return res.status(400).json({ error: 'title and teacher required' });
  const created = storage.create('courses', { title, teacher });
  return res.status(201).json(created);
};

/**
 * @swagger
 * /courses/{id}:
 *   delete:
 *     summary: Supprimer un cours
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Supprimé
 *       404:
 *         description: Non trouvé
 */
exports.deleteCourse = (req, res) => {
  const result = storage.remove('courses', req.params.id);
  if (result === false) return res.status(404).json({ error: 'Course not found' });
  if (result.error) return res.status(400).json({ error: result.error });
  return res.status(204).send();
};

exports.updateCourse = (req, res) => {
  const course = storage.get('courses', req.params.id);
  if (!course) return res.status(404).json({ error: 'Course not found' });
  const { title, teacher } = req.body;
  if (title && storage.list('courses').find((c) => c.title === title && c.id !== course.id)) {
    return res.status(400).json({ error: 'Course title must be unique' });
  }
  if (title) course.title = title;
  if (teacher) course.teacher = teacher;
  return res.json(course);
};
