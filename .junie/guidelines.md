# Project Guidelines
    
Project uses typescript, node.js, mysql. 
Mysql schema looks like: 
```
create table goods
(
GOOD_ID  int auto_increment
primary key,
CHECK_ID int          null,
NAME     varchar(255) null,
PRICE    float        null,
QUANTITY float        null,
constraint GOODS_trip_cheks_CHECK_ID_fk
foreign key (CHECK_ID) references trip_cheks (CHECK_ID)
);

create table users
(
USER_ID  int auto_increment
primary key,
login    varchar(255) null,
password varchar(255) null,
token    varchar(255) null
);

create table trips
(
TRIP_ID int auto_increment
primary key,
USER_ID int          null,
NAME    varchar(255) null,
constraint TRIPS_users_USER_ID_fk
foreign key (USER_ID) references users (USER_ID)
);

create table trip_checks
(
CHECK_ID  int auto_increment
primary key,
TRIP_ID   int   null,
USER_ID   int   null,
CHECK_SUM float null,
constraint TRIP_CHEKS_trips_TRIP_ID_fk
foreign key (TRIP_ID) references trips (TRIP_ID),
constraint TRIP_CHEKS_users_USER_ID_fk
foreign key (USER_ID) references users (USER_ID)
);

create table trips_users
(
id      int auto_increment
primary key,
TRIP_ID int null,
USER_ID int null,
constraint TRIPS_USERS_users_USER_ID_fk
foreign key (USER_ID) references users (USER_ID),
constraint trips_users_trips_TRIP_ID_fk
foreign key (TRIP_ID) references trips (TRIP_ID)
);
```
Project try follow MVC standard. 

