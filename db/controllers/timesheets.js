module.exports = {
    addTimesheet: ({ client, empid = '', projectid = '', taskid = '', loggedhours, isapproved = false, declinedcount = 0, comment = '', isholiday = false, onleave = false, comboff = false, timesheetdate }) => {
        var insertQuery = `INSERT INTO timesheets
        (empid, projectid, taskid, loggedhours, isapproved, declinedcount, comment, isholiday, onleave, comboff, timesheetdate)
	    VALUES ('${empid}', '${projectid}', '${taskid}', ${loggedhours}, ${isapproved}, ${declinedcount}, '${comment}', ${isholiday}, ${onleave}, ${comboff}, '${timesheetdate}');`;
        return new Promise((res, rej) => {
            client.query(insertQuery, (err, result) => {
                res({ err, result });
            });
        });
    },
    getTimesheet: ({ client, id, empid, projectid, year, month }) => {
        var selectQuery = `
            select 
                id,
                empid, projectid, taskid, loggedhours, isapproved, declinedcount, comment, isholiday, onleave, comboff,
                date_part('month',timesheetdate) as sheetmonth,
                date_part('day',timesheetdate) as sheetdate,
                date_part('year', timesheetdate) as sheetyear
            from timesheets
        `;
        var whereClause;
        if (id) {
            whereClause = (whereClause ? whereClause + ' and ' : ' ') + ` id=${id}`;
        }
        if (empid) {
            whereClause = (whereClause ? whereClause + ' and ' : ' ') + ` empid='${empid}'`;
        }

        if (projectid) {
            whereClause = (whereClause ? whereClause + ' and ' : ' ') + ` projectid='${projectid}'`;
        }

        if (month) {
            whereClause = (whereClause ? whereClause + ' and ' : ' ') + ` date_part('month', timesheetdate)=${month}`;
        }

        if (year) {
            whereClause = (whereClause ? whereClause + ' and ' : ' ') + ` date_part('year', timesheetdate)=${year}`;
        }

        if (whereClause) {
            selectQuery = selectQuery + ' where ' + whereClause;
        }

        return new Promise((res, rej) => {
            client.query(selectQuery, (err, result) => {
                res({ err, result });
            });
        });
    }
};