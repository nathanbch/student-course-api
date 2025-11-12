const studentsController = require('../../src/controllers/studentsController');
const s = require('../../src/services/storage');

jest.mock('../../src/services/storage');

describe('studentsController', () => {
  let req, res;

  beforeEach(() => {
    req = { params: {}, body: {}, query: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };

    s.getStudentCourses = jest.fn();
    s.create = jest.fn();
    s.get = jest.fn();
    s.list = jest.fn();
    s.remove = jest.fn();

    jest.clearAllMocks();
  });

  // --- listStudents : filtrage ---
  test('listStudents should filter by name and email', () => {
    const students = [
      { id: 1, name: 'Alice', email: 'alice@example.com' },
      { id: 2, name: 'Bob', email: 'bob@example.com' },
    ];
    s.list.mockReturnValue(students);

    req.query = { name: 'Alice', email: 'alice@example.com' };
    studentsController.listStudents(req, res);

    expect(s.list).toHaveBeenCalledWith('students');
    expect(res.json).toHaveBeenCalledWith({
      students: [students[0]],
      total: 1,
    });
  });

  // --- getStudent : 404 ---
  test('getStudent should return 404 if not found', () => {
    s.get.mockReturnValue(undefined);
    req.params.id = '999';

    studentsController.getStudent(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Student not found' });
  });

  // --- getStudent : succès ---
  test('getStudent should return student with courses', () => {
    const fakeStudent = { id: 1, name: 'Alice', email: 'alice@example.com' };
    const fakeCourses = [{ id: 10, title: 'Math' }];
    s.get.mockReturnValue(fakeStudent);
    s.getStudentCourses.mockReturnValue(fakeCourses);

    req.params.id = '1';
    studentsController.getStudent(req, res);

    expect(s.get).toHaveBeenCalledWith('students', '1');
    expect(s.getStudentCourses).toHaveBeenCalledWith('1');
    expect(res.json).toHaveBeenCalledWith({
      student: fakeStudent,
      courses: fakeCourses,
    });
  });

  // --- createStudent : champs manquants ---
  test('createStudent should return 400 if missing name or email', () => {
    req.body = { name: '' };
    studentsController.createStudent(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'name and email required' });
  });

  // --- createStudent : erreur de création ---
  test('createStudent should return 400 when storage.create returns an error', () => {
    req.body = { name: 'Bob', email: 'bob@example.com' };
    s.create.mockReturnValue({ error: 'Email must be unique' });

    studentsController.createStudent(req, res);

    expect(s.create).toHaveBeenCalledWith('students', {
      name: 'Bob',
      email: 'bob@example.com',
    });
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Email must be unique' });
  });

  // --- createStudent : succès ---
  test('createStudent should return 201 with created student', () => {
    req.body = { name: 'Charlie', email: 'charlie@example.com' };
    const newStudent = { id: 5, name: 'Charlie', email: 'charlie@example.com' };
    s.create.mockReturnValue(newStudent);

    studentsController.createStudent(req, res);

    expect(s.create).toHaveBeenCalledWith('students', {
      name: 'Charlie',
      email: 'charlie@example.com',
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(newStudent);
  });

  // --- deleteStudent : not found ---
  test('deleteStudent should return 404 if student not found', () => {
    s.remove.mockReturnValue(false);
    req.params.id = '99';

    studentsController.deleteStudent(req, res);

    expect(s.remove).toHaveBeenCalledWith('students', '99');
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Student not found' });
  });

  // --- deleteStudent : erreur ---
  test('deleteStudent should return 400 if remove returns an error', () => {
    s.remove.mockReturnValue({ error: 'Cannot delete student' });
    req.params.id = '10';

    studentsController.deleteStudent(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Cannot delete student' });
  });

  // --- deleteStudent : succès ---
  test('deleteStudent should return 204 on success', () => {
    s.remove.mockReturnValue(true);
    req.params.id = '1';

    studentsController.deleteStudent(req, res);

    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
  });

  // --- updateStudent : not found ---
  test('updateStudent should return 404 if student not found', () => {
    s.get.mockReturnValue(undefined);
    req.params.id = '123';

    studentsController.updateStudent(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Student not found' });
  });

  // --- updateStudent : email déjà utilisé ---
  test('updateStudent should return 400 if email already exists', () => {
    const student = { id: 1, name: 'Old', email: 'old@test.com' };
    s.get.mockReturnValue(student);
    s.list.mockReturnValue([
      { id: 2, name: 'Other', email: 'duplicate@test.com' },
    ]);

    req.params.id = '1';
    req.body = { email: 'duplicate@test.com' };

    studentsController.updateStudent(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Email must be unique' });
  });

  // --- updateStudent : succès (nom et email mis à jour) ---
  test('updateStudent should update name and email successfully', () => {
    const student = { id: 1, name: 'Old', email: 'old@test.com' };
    s.get.mockReturnValue(student);
    s.list.mockReturnValue([{ id: 1, name: 'Old', email: 'old@test.com' }]);

    req.params.id = '1';
    req.body = { name: 'New', email: 'new@test.com' };

    studentsController.updateStudent(req, res);

    expect(student.name).toBe('New');
    expect(student.email).toBe('new@test.com');
    expect(res.json).toHaveBeenCalledWith(student);
  });
});
