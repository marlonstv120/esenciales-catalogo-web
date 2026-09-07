const app = require('./app');

const PORT = process.env.PORT || 3000; //lee port desde variables de entorno, si no existe usa 3000

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
