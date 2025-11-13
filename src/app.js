const express = require('express');
const swaggerUi = require('swagger-ui-express');

const studentsRoutes = require('./routes/students');
const coursesRoutes = require('./routes/courses');
const swaggerJson = require('../swagger.json');
const storage = require('./services/storage');

const app = express();
app.use(express.json());

// 👉 On utilise uniquement le swagger.json statique
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerJson));

// Préremplissage du stockage
storage.seed();

// Routes principales
app.use('/students', studentsRoutes);
app.use('/courses', coursesRoutes);

// Middleware 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Middleware d'erreur
app.use((err, req, res) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Démarrage du serveur uniquement si exécuté directement
if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

module.exports = app;
