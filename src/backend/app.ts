import express from "express";
import routes from "./routes";
import passport from "./config/passport";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const host = '127.0.0.1';
const port = 7000;

app.use('/api', routes);
app.get('/', (req, res) => {
    res.send('hello world')
})
app.listen(port, host, () =>
    console.log(`Server listens http://${host}:${port}`)
);


