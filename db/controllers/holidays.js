module.exports = {
    getHolidays: ({ Id, client }) => {
        var selectQuery = `select * from holidays`;
        return new Promise((res, rej) => {
            client.query(selectQuery, (err, result) => {
                res({ err, result });
            });
        });
    },
    addHoliday: ({ name, holidaydate, isoptional, client }) => {
        var insertQuery = `insert into holidays (name, holidaydate, isoptional) values ('${name}', '${holidaydate}', '${isoptional}')`;
        return new Promise((res, rej) => {
            client.query(insertQuery, (err, result) => {
                res({ err, result });
            });
        });
    }
};