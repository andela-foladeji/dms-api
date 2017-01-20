import express from 'express';
import bodyParser from 'body-parser';
import user from './routes/user-routes';
import role from './routes/role-routes';
import document from './routes/document-routes';

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.status(200).send('Welcome to DMS');
});

app.use('/users', user);
app.use('/documents', document);
app.use('/role', role);


app.listen(port, () => {
});

export default app;
