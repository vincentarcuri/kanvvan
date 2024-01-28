DROP TABLE IF EXISTS kanban;
DROP TABLE IF EXISTS label;
DROP TABLE IF EXISTS todo;

CREATE TABLE location(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lat FLOAT,
    lon FLOAT 
);

CREATE TABLE label(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    color TEXT NOT NULL DEFAULT "#b3ffcc"
);

CREATE TABLE section(
    id INTEGER PRIMARY KEY,
    name TEXT UNIQUE NOT NULL
);

CREATE TABLE kanban(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    label_id INTEGER,
    title TEXT NOT NULL,
    due TEXT NOT NULL,
    section_id INTEGER NOT NULL,
    FOREIGN KEY (label_id) REFERENCES label (id),
    FOREIGN KEY (section_id) REFERENCES section (id)
);

CREATE TABLE todo(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    done INTEGER NOT NULL,
    date TEXT NOT NULL
);

INSERT into label ('id', 'name', 'color') VALUES (0, "" , "#ffffff00");
INSERT INTO section ('id', 'name') VALUES (1, "To-Do");
INSERT INTO section ('id', 'name') VALUES (2, "In Progress");
INSERT INTO section ('id', 'name') VALUES (3, "Done");
INSERT INTO location ('lat', 'lon') VALUES (40.766115039858654, -73.97630234286537);


