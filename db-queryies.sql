drop table businessunit;
drop table designation;
drop table emergencycontacts;
drop table employee;
drop table employeeprojectallocation;
drop table holidays;
drop table practise;
drop table projects;
drop table tasks;
drop table timesheetcomments;
drop table timesheets;
drop table submissions;
drop table logs;
drop table projectsubmissions;
drop table permissioncode;
drop table userpermissions;


create table businessunit (
    id serial primary key not null,
    name varchar(100),
    addedby int,
    addeddate date
);


create table designation (
    id serial primary key not null,
    name varchar(100)
);


create table emergencycontacts (
    id serial primary key not null,
    name varchar(150),
    relationship varchar(100),
    isprimary boolean,
    address text,
    empid int
);


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
    lastloggeddate timestamp with time zone,
    logintime timestamp with time zone
);



CREATE TABLE employeeprojectallocation
(
    id serial primary key not null,
    empid character varying(100),
    projectid character varying(100),
    startdate date,
    enddate date,
    isbillable character varying(20),
    role character varying(100),
    allocationtype character varying(100),
    reportingto varchar(10),
    subteam varchar(50)
);


CREATE TABLE holidays
(
    id serial primary key not null,
    name character varying(100) ,
    holidaydate date,
    isoptional character varying(20)
);



CREATE TABLE practise
(
    id serial primary key not null,
    name character varying(100)
);



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


CREATE TABLE tasks
(
    id serial primary key not null,
    name character varying(100) ,
    expectedwork character varying(20)
);


CREATE TABLE timesheetcomments
(
    id serial primary key not null,
    comment text ,
    commentby numeric,
    commentdate date,
    viewcount numeric,
    timesheetid numeric
);


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



create table submissions (
	id serial primary key,
    empid varchar(150),
    pid	numeric,
    submonth numeric,
    subyear numeric,
    subcount numeric,
    submittedon timestamp with time zone
);

create table logs (
	id serial primary key,
    updateby varchar(100),
    updateddate timestamp with time zone,
    tablename varchar(100),
    actiontype varchar(10),
    updateddata text,
   	updatinginfo text
);

create table projectsubmissions (
    id serial primary key,
    pid numeric,
    submonth numeric,
    subyear numeric,
    submittedon timestamp with time zone,
    submittedby varchar(50)
);


create table permissioncode(
	id serial primary key,
    name varchar(50),
    code varchar(10),
    description text
);
create table userpermissions (
	id serial primary key,
    code varchar(10),
    empid varchar(50)
);



-- To Add root user in DB
insert into employee (firstname, lastname, empid, password, emailid, reportingmanger, role)
values ('root', 'root', '0', 'root', 'mtottimpudi', 0, 'admin');

insert into projects (name)
values ('Non Billing (On Leave)');

