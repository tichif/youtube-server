import express from 'express';
require('dotenv').config();

const app = express();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`App is running on port ${PORT}`);
});

const signals = ['SIGTERM', 'SIGINT'];

// shutdown server based on signals
function gracefulShutdown(signal: string) {
  process.on(signal, async () => {
    server.close();

    // disconnect from the DB

    console.log('My work here is done...');

    process.exit(0);
  });
}

for (let i = 0; i < signals.length; i++) {
  gracefulShutdown(signals[i]);
}
