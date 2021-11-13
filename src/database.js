const MYSQL = require('mysql');
const { promisify } = require('util');
const { database } = require('./key.js');

const db = MYSQL.createPool(database);
let errorCount = 0;

const pool = () => {
    db.getConnection((err,connection) => {
        if (err) {
            if (errorCount <= 2) {
                console.log('THERE IS A PROBLEM WITH THE CONNECTION IN THE DATABASE, ERROR CODE: ', err.code);
                setTimeout(() => { pool() },1000);
                errorCount += 1;
            };
            return;
        };

        if (connection) connection.release();
        console.log('THE DATABASE HAS BEEN SUCCESSFULLY CONNECTED');
        return;
    })
};

pool();

db.query = promisify(db.query);

module.exports = db;