import mysql from "mysql2/promise";
import  bcrypt from "bcryptjs";
import crypto from "crypto";
import {SALT_ROUND} from "../config/config";
import {IUserRow} from "../types";
export class UserController {
    private pool: mysql.Pool;
    constructor(pool: mysql.Pool) {
        this.pool = pool
    }
    async registration(login, password) {
        try{
            const salt = await bcrypt.genSalt(SALT_ROUND);
            const hashedPassword = await bcrypt.hash(password, salt);
            const token = crypto.randomBytes(32).toString('hex');
            await this.pool.query(`INSERT INTO users(login, password, token) VALUES (?, ?, ?)`, [login, hashedPassword, token]);
            return token;
        }catch (e) {
            throw new Error(e)
            return false;
        }
    }

    async login(login, password): Promise<string | boolean> {
        const [rows] = await this.pool.query<IUserRow[]>(
            `SELECT * FROM users WHERE login = ?`,
            [login]
        );

        if (rows.length === 0) return false;
        const isMatch = await bcrypt.compare(password, rows[0].password);
        return isMatch ? rows[0].token : false;
    }

    async checkIfUserExistByLogin(login): Promise<boolean> {
        const [rows] = await this.pool.query<IUserRow[]>(
            `SELECT * FROM users WHERE login = ?`,
            [login]
        );
        return !!rows[0];
    }

    async getUserByToken(token): Promise<IUserRow> {
        const [rows] = await this.pool.query<IUserRow[]>(
            `SELECT * FROM users WHERE token = ?`,
            [token]
        );
        return rows[0];
    }
}
