CREATE DATABASE churchAdministration;

CREATE TABLE fullnamemember (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(50),
    secondName VARCHAR(50),
    lastName VARCHAR(50),
    secondSurname VARCHAR(50),
    nameAbbreviation VARCHAR(50) NOT NULL,
    FULLTEXT(nameAbbreviation),
    PRIMARY KEY(id)
);

CREATE TABLE member (
    id INT NOT NULL AUTO_INCREMENT,
    id_fullnamemember INT NOT NULL,
    sex VARCHAR(10),
    phoneNumber VARCHAR(20),
    identification VARCHAR(20),
    dateOfBirth DATETIME,
    age VARCHAR(5),
    address VARCHAR(150),
    familyMembers VARCHAR(4),
    familyRelationship VARCHAR(50),
    professionJob VARCHAR(50),
    email VARCHAR(50),
    christeningDate DATETIME,
    beliverStatus VARCHAR(10),
    biography TEXT(2500),
    churchCharge VARCHAR(60),
    discipleship BOOLEAN,
    creationDate DATETIME NOT NULL,
    modificationDate DATETIME NOT NULL,
    INDEX churchAdministration_fullnamemember_idx (id_fullnamemember ASC) VISIBLE,
    PRIMARY KEY(id),
    CONSTRAINT fk_name_member FOREIGN KEY (id_fullnamemember) REFERENCES fullnamemember(id)
);

CREATE TABLE finance (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(30) NOT NULL,
    dataType VARCHAR(30) NOT NULL,
    specifyDataType VARCHAR(30) NOT NULL,
    amount INT NOT NULL,
    description TEXT(2500),
    creationDate DATETIME NOT NULL,
    modificationDate DATETIME NOT NULL,
    FULLTEXT(name),
    INDEX  churchAdministration_finance_name_idx (name ASC) VISIBLE,
    PRIMARY KEY(id)
);

CREATE TABLE discipleship (
    id_discipleship INT NOT NULL AUTO_INCREMENT,
    member_id INT NOT NULL,
    assistance INT,
    consolidationPersonCount INT,
    discipleshipCreationDate DATETIME NOT NULL,
    modificationDate DATETIME NOT NULL,
    PRIMARY KEY(id_discipleship),
    CONSTRAINT fk_member_id FOREIGN KEY (member_id) REFERENCES member(id)
);

/*Crear la base de datos*/

CREATE TABLE assistance_discipleship (
    id INT NOT NULL AUTO_INCREMENT,
    discipleship_id INT NOT NULL,
    verification BOOLEAN NOT NULL,
    creationDate DATETIME NOT NULL,
    PRIMARY KEY(id),
    CONSTRAINT fk_discipleship_assistance_id FOREIGN KEY (discipleship_id) REFERENCES discipleship(id_discipleship)
);

/*----------------------*/

CREATE TABLE person (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    lastName VARCHAR(50) NOT NULL,
    age VARCHAR(5) NOT NULL,
    phoneNumber VARCHAR(20) NOT NULL,
    address VARCHAR(150),
    creationDate DATETIME NOT NULL,
    modificationDate DATETIME NOT NULL,
    PRIMARY KEY(id)
);

CREATE TABLE consolidationPerson (
    person_id INT NOT NULL,
    discipleship_id INT NOT NULL,
    CONSTRAINT fk_people_id FOREIGN KEY (person_id) REFERENCES person(id),
    CONSTRAINT fk_discipleship_id FOREIGN KEY (discipleship_id) REFERENCES discipleship(id_discipleship)
);

CREATE TABLE personProcess (
    id INT NOT NULL AUTO_INCREMENT,
    title VARCHAR(50) NOT NULL,
    description TEXT(2500),
    observation VARCHAR(300),
    consolidationLeader VARCHAR NOT NULL,
    creationDate DATETIME NOT NULL,
    modificationDate DATETIME NOT NULL,
    person_id INT NOT NULL,
    CONSTRAINT fk_people_proccess_id FOREIGN KEY(person_id) REFERENCES person(id),
    PRIMARY KEY(id)
);