import express from 'express'
import {ChequeData} from "../../types";
import {sendChequeRequest} from "../check/requestForCheck";
import {ReceiptParser} from "../check/parseCheck";
const app = express()
const port = 3000

app.get('/', async (req, res) => {
    const chequeData: ChequeData = {
        fn: '7384440800215290',
        fd: '2271',
        fp: '1305261358',
        total: '1250.00',
        date: '2025-03-03',
        time: '13:00',
    };

    const data = await sendChequeRequest(chequeData)
    const parser = new ReceiptParser(data.data)
    res.send(JSON.stringify(parser.parse()))
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
