const coursesController = require('../../src/controllers/coursesController');
const storage = require('../../src/services/storage');

jest.mock('../../src/services/storage');

describe('coursesController', () => {
  let req, res;

  beforeEach(() => {
    req = { params: {}, body: {}, query: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  test('getCourse should return course and students when found', () => {
    const fakeCourse = { id: 1, title: 'Math' };
    const fakeStudents = [{ id: 10, name: 'Alice' }];
    storage.get.mockReturnValue(fakeCourse);
    storage.getCourseStudents.mockReturnValue(fakeStudents);

    req.params.id = '1';
    coursesController.getCourse(req, res);

    expect(storage.get).toHaveBeenCalledWith('courses', '1');
    expect(storage.getCourseStudents).toHaveBeenCalledWith('1');
    expect(res.json).toHaveBeenCalledWith({
      course: fakeCourse,
      students: fakeStudents,
    });
  });

  test('updateCourse should return 400 if title is not unique', () => {
    const existingCourse = { id: 1, title: 'Math' };
    storage.get.mockReturnValue(existingCourse);
    storage.list.mockReturnValue([
      { id: 1, title: 'Math' },
      { id: 2, title: 'Math' },
    ]);

    req.params.id = '1';
    req.body = { title: 'Math' };

    coursesController.updateCourse(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Course title must be unique',
    });
  });

  test('updateCourse should update course fields successfully', () => {
    const course = { id: 1, title: 'Old', teacher: 'John' };
    storage.get.mockReturnValue(course);
    storage.list.mockReturnValue([{ id: 1, title: 'Old' }]);

    req.params.id = '1';
    req.body = { title: 'New Title', teacher: 'Mary' };

    coursesController.updateCourse(req, res);

    expect(course.title).toBe('New Title');
    expect(course.teacher).toBe('Mary');
    expect(res.json).toHaveBeenCalledWith(course);
  });
});
