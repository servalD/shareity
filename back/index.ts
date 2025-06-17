import express from 'express';
import bodyParser from 'body-parser';
import sequelize from './config/database.config';
import cors from "cors";
import { CauseController, EventController, TicketController } from './controllers';

const app = express();
const PORT = process.env.PORT;

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
    console.log(`listening on port ${PORT}`);
  });
}).catch((error) => console.error('Error connecting to database', error));