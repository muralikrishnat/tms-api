
module.exports = {
    getEmployees: ({ EmpId, ProjectId, client }) => {
        var employeeSelect = `
        select 
                id, firstname, lastname, empid, personalemailid, emailid, designation, reportingmanger, practise, practiserole, role, jobfamily, jobgrade, department, doj, location, address, dob, addedby,
                addeddate 
        from employee
        `;
        var whereString = ' where ';
        if (EmpId) {
            employeeSelect = employeeSelect + whereString + ` empid = '${EmpId}'`;
        } else if (ProjectId) {
            employeeSelect = employeeSelect + whereString + ` empid in (select  empid from employeeprojectallocation where projectid = '${ProjectId}')`;
        }

        return new Promise((res, rej) => {
            client.query(employeeSelect, (err, result) => {
                res({ err, result });
            });
        });
    },

    addEmployee: ({ client,
        firstname = '',
        lastname = '',
        empid,
        password,
        personalemailid = '',
        emailid,
        designation = '',
        reportingmanger,
        practise = '',
        practiserole = '',
        role = '',
        jobfamily = '',
        jobgrade = '',
        department = '',
        doj,
        location = '',
        address = '',
        dob,
        addedby = '',
        addeddate,
        loggedUser
    }) => {
        return new Promise((res, rej) => {
            var insertQuery = 'insert into employee ',
                namesArr = [],
                valuesArr = [];
            namesArr.push('firstname, lastname, empid, password, personalemailid, emailid, designation');
            valuesArr.push(`'${firstname}', '${lastname}','${empid}', '${password}', '${personalemailid}', '${emailid}', '${designation}'`);

            if (!isNaN(parseInt(reportingmanger))) {
                namesArr.push('reportingmanger');
                valuesArr.push(`${reportingmanger}`);
            }

            namesArr.push('practise, practiserole, role, jobfamily, jobgrade, department, location, address, addedby');
            valuesArr.push(`'${practise}', '${practiserole}', '${role}', '${jobfamily}', '${jobgrade}', '${department}', '${location}', '${address}', '${addedby}'`);

            if (doj) {
                namesArr.push('doj');
                valuesArr.push(`'${doj}'`);
            }

            if (dob) {
                namesArr.push('dob');
                valuesArr.push(`'${dob}'`);
            }

            if (addeddate) {
                namesArr.push('addeddate');
                valuesArr.push(`'${addeddate}'`);
            }
            insertQuery = insertQuery + ' (' + namesArr.join(',') + ') values (' + valuesArr.join(',') + ');';
            client.query(insertQuery, (err, result) => {
                res({ err, result });
            });
        });

    }
};