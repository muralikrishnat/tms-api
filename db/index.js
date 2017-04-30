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

var env,
    action;
if (process.argv.length > 0) {
    process.argv.forEach((t) => {
        var kname = t.split('=')[0];
        if (kname === 'env' && t.split('=').length > 0) {
            env = t.split('=')[1];
        }

        switch (kname) {
            case 'do':
                action = t.split('=').length > 0 ? t.split('=')[1] : null;
                break;

            default:
                break;
        }
    });
    if (env && env === 'gcloud') {
        config.host = '104.155.62.60';
        config.password = 'password';
    }

}


var pool = new pg.Pool(config);

var checkAndConnect = () => {
    return new Promise((res, rej) => {
        pool.connect(function (err, client, done) {
            if (err) {
                console.log('connection error', config);
                res({ err });
            } else {
                res({ client, done });
            }
        });
    });
};

var guid = (len) => {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    if (len == 8) {
        return s4() + s4();
    }
    switch (len) {
        case 4:
            return s4();
            break;
        case 8:
            return s4() + s4();
            break;
        case 12:
            return s4() + s4() + s4();
            break;
    }
    return s4() + s4() + s4() + s4() + s4() + s4() + (new Date).getTime().toString(16);
};

var { getEmployees, addEmployee } = require('./controllers/employee');
var { getProjects } = require('./controllers/projects');
var { getHolidays, addHoliday } = require('./controllers/holidays');
var { addTimesheet, getTimesheet } = require('./controllers/timesheets');
module.exports = {
    submissions: ({ get, loggedUser, id, empid, pid, submonth, subyear, subcount }) => {
        return new Promise((res, rej) => {
            var query = '',
                fieldsmissing = false;
            if (get) {
                query = 'select * from submissions;';
            } else {
                if (!id) {
                    if (empid && pid != null && submonth != null && subyear != null && subcount != null) {
                        if (pid.split(',').length > 1) {
                            pid.split(',').forEach((r) => {
                                query += `
                                    insert into submissions (empid, pid, submonth, subyear, subcount, submittedon)
                                    values ('${empid}', ${r}, ${submonth}, ${subyear}, ${subcount}, now());
                                `;
                            });
                        } else {
                            query = `
                                insert into submissions (empid, pid, submonth, subyear, subcount, submittedon)
                                values ('${empid}', ${pid}, ${submonth}, ${subyear}, ${subcount}, now());
                            `;
                        }
                    } else {
                        fieldsmissing = true;
                    }
                } else {
                    query = 'update submissions ';
                    if (subcount) {
                        query = query + ` set subcount=${subcount}, submittedon=now() where id=${id}`;
                    } else {
                        fieldsmissing = true;
                    }
                }
            }
            if (fieldsmissing) {
                res({ err: { code: 2323, msg: 'required fields missing' } });
            }
            else {
                checkAndConnect().then(({ err, client, done }) => {
                    if (!err) {
                        client.query(query, (cErr, result) => {
                            done();
                            if (!cErr) {
                                res({ result: result.rows });
                            } else {
                                res({ err: { code: 2324, msg: 'query Issue', details: cErr } });
                            }
                        });
                    } else {
                        res({ err: { code: 2323, msg: 'Connection Issue', details: err } });
                    }
                });
            }

        });
    },
    executedbquery: ({ query }) => {
        return new Promise((res, rej) => {
            if (query) {
                checkAndConnect().then(({ err, client, done }) => {
                    if (!err) {
                        client.query(query, (cErr, result) => {
                            done();
                            if (!cErr) {
                                res({ result });
                            } else {
                                res({ err: { code: 2324, msg: 'query Issue', details: cErr } });
                            }
                        });
                    } else {
                        res({ err: { code: 2323, msg: 'Connection Issue', details: err } });
                    }
                });
            } else {
                res({ err: { code: 2323, msg: 'query field is missing' } });
            }
        });
    },
    forgotpassword: (pData) => {
        return new Promise((res, rej) => {
            if (pData.username) {
                checkAndConnect().then(({ err, client, done }) => {
                    var generatedPassword = guid(8);
                    var queryToExecute = `
                        update employee set password='${generatedPassword}'
                        where empid='${pData.username}'  or emailid='${pData.username}';
                        select emailid from employee 
                        where empid='${pData.username}'  or emailid='${pData.username}';
                    `;
                    client.query(queryToExecute, (cErr, result) => {
                        done();
                        if (!cErr) {
                            if (result.rows && result.rows.length > 0) {
                                let mailOptions = {
                                    from: '"Timesheet Manager" <muralit.evoke@gmail.com>',
                                    to: result.rows[0].emailid.replace('@evoketechnologies.com', '') + '@evoketechnologies.com',
                                    subject: 'Password reset',
                                    text: 'Password reset',
                                    html: `Your new password is :  <b>${generatedPassword}</b>`
                                };
                                require('./mail-manager').sendMail(mailOptions);
                                res({ result: result.rows });
                            } else {
                                res({ err: { code: 111, msg: 'emailid or empid not found' } });
                            }

                        } else {
                            res({ err: { code: 113, details: cErr } });
                        }
                    });
                });
            } else {
                res({ err: { code: 112, msg: 'username field is missing' } });
            }
        });
    },
    selectimesheetcomments: () => {
        return new Promise((res, rej) => {
            checkAndConnect().then(({ err, client, done }) => {
                var queryToExecute = 'select * from timesheetcomments';
                client.query(queryToExecute, (cErr, result) => {
                    done();
                    if (!cErr) {
                        res({ err: cErr, result });
                    } else {
                        res({ err: cErr });
                    }
                });
            });
        });
    },
    updatetimesheetcomment: ({ loggedUser, timesheetids, comment, commentdate }) => {
        return new Promise((res, rej) => {
            checkAndConnect().then(({ err, client, done }) => {
                var queryToExecute = '';
                var commentby = loggedUser.id || 0;
                if (timesheetids.indexOf(',') > 0) {
                    var queries = [];
                    timesheetids.indexOf(',').forEach((r) => {
                        queries = `
                        insert into timesheetcomments 
                            (comment, commentby, commentdate, viewcount, timesheetid)
                        values 
                            ('${comment}', ${commentby}, now(), 0, ${r})
                    `;
                    });
                    queryToExecute = queries.join(';');
                } else {
                    queryToExecute = `
                    insert into timesheetcomments 
                        (comment, commentby, commentdate, viewcount, timesheetid)
                    values 
                        ('${comment}', ${commentby}, now(), 0, ${timesheetids})
                `;
                }
                client.query(queryToExecute, (cErr, result) => {
                    done();
                    if (!cErr) {
                        res({ err: cErr, result });
                    } else {
                        res({ err: cErr });
                    }
                });
            });
        });
    },
    sendAprovalMail: ({ toAddress, subject, mailContent, textContent }) => {
        return new Promise((res, rej) => {
            let mailOptions = {
                from: '"Timesheet Manager" <muralit.evoke@gmail.com>',
                to: toAddress || 'mtottimpudi@evoketechnologies.com',
                subject: subject || 'Timesheet Updation',
                text: textContent,
                html: mailContent
            };
            require('./mail-manager').sendMail(mailOptions).then(({ err, result }) => {
                res({ err, result });
            });
        });
    },
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
        id,
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
                            valuesArr = [],
                            queryToExecute = '';
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
                        queryToExecute = insertQuery + ' (' + namesArr.join(',') + ') values (' + valuesArr.join(',') + ')';
                        if (id) {
                            queryToExecute = `update projects 
                                            set 
                                                name='${name}',
                                                actualstartdate='${actualstartdate}'
                                                actualenddate='${actualenddate}'
                                                where id=${id} ;
                                            `;
                        }
                        client.query(queryToExecute, (cErr, result) => {
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

                    namesArr.push('empid, projectid, isbillable, role, allocationtype');
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
                        if (isbillable) {
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
                var mailContent = 'Your timesheet is Updated';
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

                            // let mailOptions = {
                            //     from: '"Timesheet Manager" <muralit.evoke@gmail.com>',
                            //     to: 'mtottimpudi@evoketechnologies.com',
                            //     subject: 'Timesheet Updation',
                            //     text: mailContent,
                            //     html: '<b>'+ mailContent +'</b>'
                            // };
                            // require('./mail-manager').sendMail(mailOptions);
                            console.log('results ', result);
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


