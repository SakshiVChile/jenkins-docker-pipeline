const { createServer } = require('./app');

const PORT = process.env.PORT || 3000;

createServer().listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
