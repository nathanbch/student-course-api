const e = require('express');
const {
  listStudents,
  getStudent,
  createStudent,
  deleteStudent,
  updateStudent,
} = require('../controllers/studentsController');
const r = e.Router();
r.get('/', listStudents);
r.get('/:id', getStudent);
r.post('/', createStudent);
r.delete('/:id', deleteStudent);
r.put('/:id', updateStudent);
module.exports = r;
