import 'reflect-metadata';
import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import exphbs from 'express-handlebars';
import { initDataSource } from './config/database.js';
import { errorHandler } from './middleware/errorHandler.js';
import webRoutes from './routes/web.js';
import apiRoutes from './routes/index.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const startServer = async () => {
  await initDataSource();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, '../public')));

app.engine('hbs', exphbs.engine({
  extname: '.hbs',
  defaultLayout: 'root',
  layoutsDir: path.join(__dirname, '../views/layouts'),
  partialsDir: path.join(__dirname, '../views/partials'),
  helpers: {
    formatDate: (date) => {
      if (!date) return '';
      return new Date(date).toLocaleString('vi-VN');
    },
    formatDateInput: (date) => {
      if (!date) return '';
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    },
  },
}));

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, '../views'));

app.use('/', webRoutes);
app.use('/', apiRoutes);

app.use((req, res) => {
  res.status(404).render('error', { 
    title: '404 - Not Found',
    message: 'Page not found',
  });
});

app.use(errorHandler);

  const PORT = process.env.PORT || 3000;

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

startServer();
