import express from "express";
import routes from "./routes";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const host = '0.0.0.0';
const port = 7000;

app.use('/api', routes);
app.get('/', (req, res) => {
    res.send('hello world')
})
app.listen(port, host, () =>
    console.log(`Server listens http://${host}:${port}`)
);
