import MySqli from 'mysqli';

let conn = new MySqli({
    host: 'localhost',
    post: '3306',
    user: 'root',
    passwd: '',
    db: 'chef_zone'
});

export const   database = conn.emit(false, '');

module.exports = {
    database: db
}
