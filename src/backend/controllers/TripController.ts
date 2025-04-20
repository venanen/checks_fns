import mysql from "mysql2/promise";
import {ITripRow, IUserRow} from "../types";

export class TripController {
    private pool: mysql.Pool;

    constructor(pool: mysql.Pool) {
        this.pool = pool
    }

    getTrips(userId: IUserRow['id']) {
        return this.pool.query(`SELECT * FROM trips WHERE USER_ID = ?`, [userId]);
    }

    createTrip(tripName: ITripRow['name'], userId: IUserRow['id']) {
        return this.pool.query(`INSERT INTO trips (USER_ID, NAME) VALUES (?, ?)`, [userId, tripName]);
    }

    checkTripOwner(tripId: ITripRow['name'], userId: IUserRow['id']) {
        return this.pool.query(`SELECT * FROM trips WHERE ID = ? AND USER_ID = ?`, [tripId, userId]);
    }
    checkTripId(tripId: ITripRow['name']) {
        return this.pool.query(`SELECT * FROM trips WHERE ID = ?`, [tripId]);
    }

    async insertCheckInTrip(tripId: ITripRow['name'], userId: IUserRow['id'], sum: number, goods: Array<string>) {
        const data = await this.pool.query(`INSERT INTO trip_checks (TRIP_ID, USER_ID, CHECK_SUM) VALUES (?, ?, ?)`, [tripId, userId, sum]);
        console.log(data)
        if(!data) {
            return false;
        }
        const goodsData = goods.map(v => [data[0].insertId, ...v])
        console.log(goodsData)
        return this.pool.query(`INSERT INTO goods (CHECK_ID, NAME, PRICE, QUANTITY) VALUES ?`, [
            goodsData
        ]);
    }
}
