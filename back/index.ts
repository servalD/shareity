import express from 'express';
import bodyParser from 'body-parser';
import sequelize from './config/database.config';
import cors from "cors";
import dotenv from 'dotenv';
import { CauseController, EventController, TicketController } from './controllers';

// Charger les variables d'environnement
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());

const causeController = new CauseController();
const eventController = new EventController();
const ticketController = new TicketController();

app.use('/causes', causeController.buildRoutes());
app.use('/events', eventController.buildRoutes());
app.use('/tickets', ticketController.buildRoutes());

sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server listening on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 XRPL Network: ${process.env.XRPL_NETWORK || 'testnet'}`);
  });
}).catch((error) => console.error('❌ Error connecting to database', error));

// Gestion de la fermeture propre
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server gracefully...');
  try {
    // Fermer les connexions XRPL si nécessaire
    await sequelize.close();
    console.log('✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Received SIGTERM, shutting down...');
  process.exit(0);
});
