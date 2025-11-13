// storage.js — stockage en mémoire (pour TP sans DB)
const data = {
  students: [],
  courses: [],
  enrollments: [], // { studentId, courseId }
};

let studentId = 1;
let courseId = 1;

function list(collection) {
  return data[collection];
}

function get(collection, id) {
  return data[collection].find((item) => item.id === Number(id));
}

function create(collection, payload) {
  if (collection === 'students') {
    if (data.students.find((s) => s.email === payload.email)) {
      return { error: 'Email must be unique' };
    }
  }
  if (collection === 'courses') {
    if (data.courses.find((c) => c.title === payload.title)) {
      return { error: 'Course title must be unique' };
    }
  }
  const id = collection === 'students' ? studentId++ : courseId++;
  const item = { id, ...payload };
  data[collection].push(item);
  return item;
}

function remove(collection, id) {
  if (collection === 'students') {
    if (data.enrollments.find((e) => e.studentId === Number(id))) {
      return { error: 'Cannot delete student: enrolled in a course' };
    }
  }
  if (collection === 'courses') {
    if (data.enrollments.find((e) => e.courseId === Number(id))) {
      return { error: 'Cannot delete course: students are enrolled' };
    }
  }
  const idx = data[collection].findIndex((it) => it.id === Number(id));
  if (idx === -1) return false;
  data[collection].splice(idx, 1);
  return true;
}

function enroll(studentId, courseId) {
  // Vérifie que le cours existe
  const course = get('courses', courseId);
  if (!course) return { error: 'Course not found' };
  // Vérifie que l’étudiant existe
  const student = get('students', studentId);
  if (!student) return { error: 'Student not found' };
  // Vérifie que l’étudiant n’est pas déjà inscrit
  if (
    data.enrollments.find(
      (e) => e.studentId === Number(studentId) && e.courseId === Number(courseId)
    )
  ) {
    return { error: 'Student already enrolled in this course' };
  }
  // Vérifie que le cours n’a pas plus de 3 étudiants
  const enrolledCount = data.enrollments.filter((e) => e.courseId === Number(courseId)).length;
  if (enrolledCount >= 3) return { error: 'Course is full' };
  data.enrollments.push({
    studentId: Number(studentId),
    courseId: Number(courseId),
  });
  return { success: true };
}

function unenroll(studentId, courseId) {
  const idx = data.enrollments.findIndex(
    (e) => e.studentId === Number(studentId) && e.courseId === Number(courseId)
  );
  if (idx === -1) return { error: 'Enrollment not found' };
  data.enrollments.splice(idx, 1);
  return { success: true };
}

function getStudentCourses(studentId) {
  return data.enrollments
    .filter((e) => e.studentId === Number(studentId))
    .map((e) => get('courses', e.courseId));
}

function getCourseStudents(courseId) {
  return data.enrollments
    .filter((e) => e.courseId === Number(courseId))
    .map((e) => get('students', e.studentId));
}

function reset() {
  // utile pour les tests : réinitialiser l'état
  data.students = [];
  data.courses = [];
  studentId = 1;
  courseId = 1;
}

function seed() {
  // Ajoute quelques étudiants
  create('students', { name: 'Alice', email: 'alice@example.com' });
  create('students', { name: 'Bob', email: 'bob@example.com' });
  create('students', { name: 'Charlie', email: 'charlie@example.com' });
  // Ajoute quelques cours
  create('courses', { title: 'Math', teacher: 'Mr. Smith' });
  create('courses', { title: 'Physics', teacher: 'Dr. Brown' });
  create('courses', { title: 'History', teacher: 'Ms. Clark' });
}

module.exports = {
  list,
  get,
  create,
  remove,
  reset,
  enroll,
  unenroll,
  getStudentCourses,
  getCourseStudents,
  seed,
};
