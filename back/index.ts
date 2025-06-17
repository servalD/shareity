import express from 'express';
import bodyParser from 'body-parser';
import sequelize from './config/database.config';
import cors from "cors";
import { CauseController, EventController } from './controllers';

const app = express();
const PORT = process.env.PORT;

app.use(bodyParser.json());
app.use(cors());

const causeController = new CauseController();
const eventController = new EventController();

app.use('/causes', causeController.buildRoutes());
app.use('/events', eventController.buildRoutes());

sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`);
  });
}).catch((error) => console.error('Error connecting to database', error));