-- Создание таблицы пользователей
create table users
(
    USER_ID  int auto_increment
        primary key,
    login    varchar(255) null,
    password varchar(255) null,
    token    varchar(255) null
);

-- Создание таблицы поездок
create table trips
(
    TRIP_ID int auto_increment
        primary key,
    USER_ID int          null,
    NAME    varchar(255) null,
    constraint TRIPS_users_USER_ID_fk
        foreign key (USER_ID) references users (USER_ID)
            on delete cascade
);

-- Создание таблицы проверок поездок
create table trip_checks
(
    CHECK_ID  int auto_increment
        primary key,
    TRIP_ID   int   null,
    USER_ID   int   null,
    CHECK_SUM float null,
    constraint TRIP_CHEKS_trips_TRIP_ID_fk
        foreign key (TRIP_ID) references trips (TRIP_ID)
            on delete cascade,
    constraint TRIP_CHEKS_users_USER_ID_fk
        foreign key (USER_ID) references users (USER_ID)
            on delete cascade
);

-- Создание таблицы товаров
create table goods
(
    GOOD_ID  int auto_increment
        primary key,
    CHECK_ID int          null,
    NAME     varchar(255) null,
    PRICE    float        null,
    QUANTITY float        null,
    constraint goods_trip_checks_CHECK_ID_fk
        foreign key (CHECK_ID) references trip_checks (CHECK_ID)
            on delete cascade
);

-- Создание таблицы связи поездок и пользователей
create table trips_users
(
    id      int auto_increment
        primary key,
    TRIP_ID int null,
    USER_ID int null,
    constraint TRIPS_USERS_users_USER_ID_fk
        foreign key (USER_ID) references users (USER_ID)
            on delete cascade,
    constraint trips_users_trips_TRIP_ID_fk
        foreign key (TRIP_ID) references trips (TRIP_ID)
            on delete cascade
);
