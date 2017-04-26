drop table businessunit;
create table businessunit (
    id serial primary key not null,
    name varchar(100),
    addedby int,
    addeddate date
);

drop table designation;
create table designation (
    id serial primary key not null,
    name varchar(100)
);

drop table emergencycontacts;
create table emergencycontacts (
    id serial primary key not null,
    name varchar(150),
    relationship varchar(100),
    isprimary boolean,
    address text,
    empid int
);

drop table employee;
create table employee (
    id serial primary key not null,
    firstname varchar(150),
    lastname varchar(150),
    empid varchar(150) unique,
    password varchar(150),
    personalemailid varchar(150),
    emailid varchar(150),
    designation varchar(150),
    reportingmanger int,
    practise character varying(150),
    practiserole character varying(150),
    role character varying(150),
    jobfamily character varying(150),
    jobgrade character varying(150),
    department character varying(150),
    doj date,
    location character varying(150),
    address text,
    dob date,
    addedby character varying(150),
    addeddate date,
    lastloggeddate timestamp with time zone
);


drop table employeeprojectallocation;
CREATE TABLE employeeprojectallocation
(
    id serial primary key not null,
    empid character varying(100),
    projectid character varying(100),
    startdate date,
    enddate date,
    isbillable character varying(20),
    role character varying(100),
    allocationtype character varying(100)
);

drop table holidays;
CREATE TABLE holidays
(
    id serial primary key not null,
    name character varying(100) ,
    holidaydate date,
    isoptional character varying(20)
);


drop table practise;
CREATE TABLE practise
(
    id serial primary key not null,
    name character varying(100)
);


drop table projects;
CREATE TABLE projects
(
    id serial primary key not null,
    name character varying(100) unique,
    businessid integer,
    expectedstartdate date,
    expectedenddate date,
    actualstartdate date,
    actualenddate date
);

drop table tasks;
CREATE TABLE tasks
(
    id serial primary key not null,
    name character varying(100) ,
    expectedwork character varying(20)
);

drop table timesheetcomments;
CREATE TABLE timesheetcomments
(
    id serial primary key not null,
    comment text ,
    commentby numeric,
    commentdate date,
    viewcount numeric,
    timesheetid numeric
);

drop table timesheets;
CREATE TABLE timesheets
(
    id serial primary key not null,
    empid character varying(100) ,
    projectid character varying(100) ,
    taskid character varying(100) ,
    loggedhours numeric,
    isapproved boolean,
    declinedcount numeric,
    comment text ,
    isholiday boolean,
    onleave boolean,
    comboff boolean,
    timesheetdate timestamp with time zone
);


drop table submissions;
create table submissions (
	id serial primary key,
    empid varchar(150),
    pid	numeric,
    submonth numeric,
    subyear numeric,
    subcount numeric,
    submittedon timestamp with time zone
);

-- To Add root user in DB
insert into employee (firstname, lastname, empid, password, emailid, reportingmanger, role)
values ('admin', 'admin', '1', 'admin', 'admin', 0, 'admin');

insert into projects (name)
values ('Non Billing (On Leave)');