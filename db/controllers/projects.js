module.exports = {
    getProjects: ({ EmpId, ProjectId, client }) => {
        var selectQuery = `select * from projects`;
        var whereClause = ` where `;
        if (ProjectId) {
            selectQuery = selectQuery + whereClause + ` id = '${ProjectId}'`;
        } else if (EmpId) {
            selectQuery = selectQuery + whereClause + ` id in (select projectid::numeric from employeeprojectallocation where empid = '${EmpId}')`;
        }
        return new Promise((res, rej) => {
            client.query(selectQuery, (err, result) => {
                res({ err, result });
            });
        });
    }
};