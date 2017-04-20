var pg = require('pg');

var config = {
    user: 'postgres',
    database: 'EvokeDBDev',
    password: 'murali',
    host: 'localhost',
    port: 5432,
    max: 10,
    idleTimeoutMillis: 30000,
};

var pool = new pg.Pool(config);

var checkAndConnect = () => {
    return new Promise((res, rej) => {
        pool.connect(function (err, client, done) {
            if (err) {
                res({ err });
            } else {
                res({ client, done });
            }
        });
    });
};

var { getEmployees, addEmployee } = require('./controllers/employee');
var { getProjects } = require('./controllers/projects');
var { getHolidays, addHoliday } = require('./controllers/holidays');
var { addTimesheet, getTimesheet } = require('./controllers/timesheets');
module.exports = {
    deleteProject: ({ id, loggedUser }) => {
        return new Promise((res) => {
            if (loggedUser.role === 'admin') {
                checkAndConnect().then(({ err, client, done }) => {
                    var deleteQuery = `delete from projects where id=${id}`;
                    client.query(deleteQuery, (cErr, result) => {
                        done();
                        if (!cErr) {
                            res({ err: cErr, result });
                        } else {
                            res({ err: cErr });
                        }
                    });
                });
            } else {
                res({ err: { code: 2323, msg: 'Level2 Authorization required to do this action' } });
            }
        });
    },
    deleteEmployee: (id) => {
        return new Promise((res, rej) => {
            checkAndConnect().then(({ err, client, done }) => {
                if (!err) {
                    var deleteQuery = `delete from employee where id=${id}`;
                    client.query(deleteQuery, (cErr, result) => {
                        done();
                        if (!cErr) {
                            res({ err: cErr, result });
                        } else {
                            res({ err: cErr });
                        }
                    });
                } else {
                    res({ err });
                }
            });
        });
    },
    addEmployee: ({
        id,
        firstname,
        lastname,
        empid,
        password,
        personalemailid,
        emailid,
        designation,
        reportingmanger,
        practise,
        practiserole,
        role,
        jobfamily,
        jobgrade,
        department,
        doj,
        location,
        address,
        dob,
        addedby,
        addeddate
     }) => {
        return new Promise((res, rej) => {
            checkAndConnect().then(({ err, client, done }) => {
                if (!err) {
                    if (id) {
                        var updateQuery = 'update employee ',
                            setArr = [];
                        if (doj) {
                            setArr.push(` doj='${doj}' `);
                        }

                        if (dob) {
                            setArr.push(` dob='${dob}' `);
                        }

                        if (firstname) { setArr.push(` firstname='${firstname}' `); }
                        if (lastname) { setArr.push(` lastname='${lastname}' `); }
                        if (empid) { setArr.push(` empid='${empid}' `); }
                        if (password) { setArr.push(` password='${password}' `); }
                        if (emailid) { setArr.push(` emailid='${emailid}' `); }
                        if (designation) { setArr.push(` designation='${designation}' `); }
                        if (reportingmanger) { setArr.push(` reportingmanger=${reportingmanger} `); }
                        if (practise) { setArr.push(` practise='${practise}' `); }
                        if (practiserole) { setArr.push(` practiserole='${practiserole}' `); }

                        if (role) { setArr.push(` role='${role}' `); }
                        if (jobfamily) { setArr.push(` jobfamily='${jobfamily}' `); }
                        if (jobgrade) { setArr.push(` jobgrade='${jobgrade}' `); }
                        if (department) { setArr.push(` department='${department}' `); }
                        if (location) { setArr.push(` location='${location}' `); }
                        if (address) { setArr.push(` address='${address}' `); }

                        updateQuery = updateQuery + ' set ' + setArr.join(' , ') + ` where id=${id} `;
                        client.query(updateQuery, (cErr, result) => {
                            done();
                            if (!cErr) {
                                res({ err: cErr, result });
                            } else {
                                res({ err: cErr });
                            }
                        });
                    } else {
                        addEmployee({
                            client,
                            firstname,
                            lastname,
                            empid,
                            password,
                            personalemailid,
                            emailid,
                            designation,
                            reportingmanger,
                            practise,
                            practiserole,
                            role,
                            jobfamily,
                            jobgrade,
                            department,
                            doj,
                            location,
                            address,
                            dob,
                            addedby,
                            addeddate
                        }).then(({ err, result }) => {
                            done(err);
                            res({ err, result });
                        });
                    }
                } else {
                    res({ err });
                }
            });
        });
    },
    getTimesheet: ({ id, empid, projectid, year, month }) => {
        return new Promise((res, rej) => {
            checkAndConnect().then(({ err, client, done }) => {
                if (!err) {
                    getTimesheet({ client, id, empid, projectid, year, month }).then(({ err, result }) => {
                        done(err);
                        res({ err, result });
                    });
                } else {
                    res({ err });
                }
            });
        });
    },
    addTimesheet: ({ empid, projectid, taskid, loggedhours, isapproved, declinedcount, comment, isholiday, onleave, comboff, timesheetdate }) => {
        return new Promise((res, rej) => {
            checkAndConnect().then(({ err, client, done }) => {
                if (!err) {
                    addTimesheet({ client, empid, projectid, taskid, loggedhours, isapproved, declinedcount, comment, isholiday, onleave, comboff, timesheetdate }).then(({ err, result }) => {
                        done(err);
                        res({ err, result });
                    });
                } else {
                    res({ err });
                }
            });
        });
    },
    getEmployees: ({ ProjectId, EmpId }) => {
        return new Promise((res, rej) => {
            checkAndConnect().then(({ err, client, done }) => {
                if (!err) {
                    getEmployees({ client, ProjectId, EmpId }).then(({ err, result }) => {
                        done(err);
                        res({ err, result });
                    });
                } else {
                    res({ err });
                }
            });
        });
    },
    getProjects: ({ ProjectId, EmpId }) => {
        return new Promise((res, rej) => {
            checkAndConnect().then(({ err, client, done }) => {
                if (!err) {
                    getProjects({ client, ProjectId, EmpId }).then(({ err, result }) => {
                        done(err);
                        res({ err, result });
                    });
                } else {
                    res({ err });
                }
            });
        });
    },
    getHolidays: ({ Id }) => {
        return new Promise((res, rej) => {
            checkAndConnect().then(({ err, client, done }) => {
                if (!err) {
                    getHolidays({ client, Id }).then(({ err, result }) => {
                        done(err);
                        res({ err, result });
                    });
                } else {
                    res({ err });
                }
            });
        });
    },
    addHoliday: ({ name, holidaydate, isoptional }) => {
        return new Promise((res, rej) => {
            checkAndConnect().then(({ err, client, done }) => {
                if (!err) {
                    addHoliday({ client, name, holidaydate, isoptional }).then(({ err, result }) => {
                        done(err);
                        res({ err, result });
                    });
                } else {
                    res({ err });
                }
            });
        });
    },
    authenticate: ({ username, password }) => {
        return new Promise((res, rej) => {
            checkAndConnect().then(({ err, client, done }) => {
                if (!err) {
                    client.query(`
                        select
                            id, 
                            firstname,
                            lastname,
                            empid,
                            personalemailid,
                            emailid, 
                            designation,
                            reportingmanger,
                            practise,
                            practiserole, 
                            role, 
                            jobfamily,
                            jobgrade, 
                            department,
                            doj, 
                            location,
                            address, 
                            dob,
                            addedby, 
                            addeddate,
                            (select count(*) as managerfor from employeeprojectallocation as EP  where EP.empid=E.empid and EP.role='manager')
                        from employee as E
                        where (E.empid='${username}' or E.emailid='${username}' or E.emailid=('${username}' || '@evoketechnologies.com')) and E.password='${password}'`, (cErr, result) => {
                            done();
                            res({ err: cErr, result });
                        });
                } else {
                    res({ err });
                }
            }, (err) => {
                console.log('rejected');
            });
        });
    },
    changepassword: ({ username, currentpassword, newpassword }) => {
        return new Promise((res, rej) => {
            checkAndConnect().then(({ err, client, done }) => {
                if (!err) {
                    var updateQuery = `update employee set password='${newpassword}' 
                                        where (empid='${username}' or emailid='${username}' or emailid=('${username}' || '@evoketechnologies.com')) 
                                        and password='${currentpassword}'`;
                    client.query(updateQuery, (cErr, result) => {
                        if (!err) {
                            if (result.rowCount) {
                                res({ err: cErr, result: "" });
                            }
                            res({ err: cErr, result });
                        } else {
                            res({ err: cErr, result });
                        }

                    });
                } else {
                    res({ err });
                }
            });
        });
    },
    addProject: ({
        name,
        businessid = 0,
        expectedstartdate,
        expectedenddate,
        actualstartdate,
        actualenddate,
        loggedUser
    }) => {
        return new Promise((res, rej) => {
            var isAdmin = loggedUser.role ? loggedUser.role.toUpperCase() === 'admin'.toUpperCase() : false;
            if (isAdmin) {
                checkAndConnect().then(({ err, client, done }) => {
                    if (!err) {
                        var insertQuery = 'insert into projects',
                            namesArr = [],
                            valuesArr = [];
                        namesArr.push('name, businessid');
                        valuesArr.push(`'${name}',${businessid}`);
                        if (expectedstartdate) {
                            namesArr.push('expectedstartdate');
                            valuesArr.push(`'${expectedstartdate}'`);
                        }
                        if (actualstartdate) {
                            namesArr.push('actualstartdate');
                            valuesArr.push(`'${actualstartdate}'`);
                        }
                        if (expectedenddate) {
                            namesArr.push('expectedenddate');
                            valuesArr.push(`'${expectedenddate}'`);
                        }
                        if (actualenddate) {
                            namesArr.push('actualenddate');
                            valuesArr.push(`'${actualenddate}'`);
                        }
                        insertQuery = insertQuery + ' (' + namesArr.join(',') + ') values (' + valuesArr.join(',') + ')';
                        client.query(insertQuery, (cErr, result) => {
                            done();
                            if (!cErr) {
                                res({ err: cErr, result });
                            } else {
                                res({ err: cErr });
                            }
                        });
                    } else {
                        res({ err });
                    }
                });
            } else {
                res({ err: { code: 2323, msg: 'Level2 Authorization required to do this action' } });
            }

        });
    },
    getAllocation: ({
        EmpId,
        ProjectId
    }) => {
        return new Promise((res, rej) => {
            checkAndConnect().then(({ err, client, done }) => {
                if (!err) {
                    var selectQuery = 'select * from employeeprojectallocation',
                        whereArr = [];
                    if (EmpId) {
                        whereArr.push(` empid='${EmpId}'`);
                    }
                    if (EmpId) {
                        whereArr.push(` projectid='${ProjectId}'`);
                    }
                    if (whereArr.length > 0) {
                        selectQuery = selectQuery + ' where ' + whereArr.join(' and ');
                    }
                    client.query(selectQuery, (cErr, result) => {
                        done();
                        if (!cErr) {
                            res({ err: cErr, result })
                        } else {
                            res({ err: cErr });
                        }
                    });
                } else {
                    res({ err });
                }

            });
        });
    },
    updateAllocation: ({
        id,
        empid,
        projectid,
        startdate,
        enddate,
        isbillable,
        role,
        isAdd,
        isRemove,
        isUpdate,
        loggedUser
    }) => {
        return new Promise((res, rej) => {
            checkAndConnect().then(({ err, client, done }) => {
                var queryToExecute;
                if (isAdd) {
                    var insertQuery = 'insert into employeeprojectallocation ',
                        namesArr = [],
                        valuesArr = [];

                    namesArr.push('empid, projectid, isBillable, role, allocationtype');
                    valuesArr.push(`'${empid}', '${projectid}', '${isbillable}', '${role}', 'active'`);

                    if (startdate) {
                        namesArr.push('startdate');
                        valuesArr.push(`${startDate}`);
                    }
                    if (enddate) {
                        namesArr.push('enddate');
                        valuesArr.push(`${endDate}`);
                    }

                    queryToExecute = insertQuery + ' (' + namesArr.join(',') + ') values (' + valuesArr.join(',') + ')';
                } else if (isUpdate) {
                    var updateQuery = 'update employeeprojectallocation',
                        setArr = [];
                    if (isUpdate) {
                        setArr.push(` role='${role}' `);
                        if (startdate) {
                            setArr.push(` startdate='${startdate}' `);
                        }
                        if (enddate) {
                            setArr.push(` enddate='${enddate}' `);
                        }
                        if (isBillable) {
                            setArr.push(` isbillable='${isbillable}'`);
                        }
                    }
                    if (id) {
                        queryToExecute = updateQuery + ' set ' + setArr.join(',') + `where id=${id};`;
                    } else {
                        queryToExecute = '';
                    }

                } else if (isRemove) {
                    if (id) {
                        queryToExecute = `delete from employeeprojectallocation where id=${id}`;
                    }
                }
                console.log('query to execute ', queryToExecute);
                client.query(queryToExecute, (err, result) => {
                    done(err);
                    res({ err, result });
                });
            });
        });
    },
    updateProfile: ({
        id,
        firstname,
        lastname,
        empid,
        personalemailid,
        emailid,
        designation,
        reportingmanger,
        practise,
        practiserole,
        role,
        jobfamily,
        jobgrade,
        department,
        doj,
        location,
        address,
        dob,
        addedby,
        addeddate,
        loggedUser
    }) => {
        return new Promise((res, rej) => {
            checkAndConnect().then(({ err, client, done }) => {
                if (loggedUser) {
                    var isAdmin = loggedUser.role ? loggedUser.role.toUpperCase() === 'admin'.toUpperCase() : false;
                    var updateQuery = '',
                        setArr = [];
                    updateQuery = ' update employee set ';
                    if (firstname) {
                        setArr.push(` firstname='${firstname}' `);
                    }
                    if (lastname) {
                        setArr.push(` lastname='${lastname}' `);
                    }

                    if (dob) {
                        setArr.push(` dob='${dob}'`);
                    }

                    if (location) {
                        setArr.push(` location='${location}'`);
                    }

                    if (address) {
                        setArr.push(` address='${address}'`);
                    }

                    if (personalemailid) {
                        setArr.push(` personalemailid='${personalemailid}'`);
                    }

                    if (isAdmin) {
                        if (empid) {
                            setArr.push(` empid='${empid}' `);
                        }

                        if (emailid) {
                            setArr.push(` emailid='${emailid}' `);
                        }

                        if (designation) {
                            setArr.push(` designation='${designation}' `);
                        }
                    }

                    updateQuery = updateQuery + ' ' + setArr.join(',') + ' ';
                    if (isAdmin) {
                        updateQuery = updateQuery + ` where empid='${empid}' `;
                    } else {
                        updateQuery = updateQuery + ` where empid=${loggedUser.empid}`;
                    }

                    client.query(updateQuery, (cErr, result) => {
                        done();
                        if (!cErr) {
                            if (result.rowCount) {
                                res({ err: cErr, result: "" });
                            } else {
                                res({ err: { code: 601, msg: 'Updation failed' } });
                            }
                        } else {
                            res({ err: cErr, result });
                        }
                    });
                } else {
                    res({ err: { code: 333, msg: 'Authentication required' } });
                }
            });
        });
    },
    approveTimesheets: ({
        ids,
        isapproved
    }) => {
        return new Promise((res, rej) => {
            checkAndConnect().then(({ err, client, done }) => {
                var queryToExec = `update timesheets set `;
                if (isapproved) {
                    queryToExec = queryToExec + ` isapproved=true, declinedcount=0 `;
                } else {
                    queryToExec = queryToExec + ` isapproved=false, declinedcount=1 `;
                }
                queryToExec = queryToExec + ` where id in (${ids})`;
                client.query(queryToExec, (cErr, result) => {
                    done();
                    if (!cErr) {
                        if (result.rowCount) {
                            res({ err: cErr, result: "" });
                        } else {
                            res({ err: { code: 601, msg: 'Updation failed' } });
                        }
                    } else {
                        res({ err: cErr, result });
                    }
                });
            });
        });
    },
    updateTimesheet: ({
        id,
        empid = '',
        projectid = '',
        taskid = '',
        loggedhours,
        isapproved = false,
        declinedcount = 0,
        comment = '',
        isholiday = false,
        onleave = false,
        comboff = false,
        timesheetdate,
        loggedUser
    }) => {

        return new Promise((res, rej) => {
            checkAndConnect().then(({ err, client, done }) => {
                var queryToExec = 'update timesheets ',
                    setArr = [];
                if (loggedUser) {
                    if (loggedhours) {
                        setArr.push(` loggedhours=${loggedhours} `);
                    }
                    setArr.push(` isapproved=${isapproved} `);

                    queryToExec = queryToExec + ' set ' + setArr.join(' , ') + ` where id=${id}`;
                    client.query(queryToExec, (cErr, result) => {
                        done();
                        if (!cErr) {
                            if (result.rowCount) {
                                res({ err: cErr, result: "" });
                            } else {
                                res({ err: { code: 601, msg: 'Updation failed' } });
                            }
                        } else {
                            res({ err: cErr, result });
                        }
                    });
                } else {
                    res({ err: { code: 333, msg: 'Authentication required' } });
                }
            });
        });
    }
};


