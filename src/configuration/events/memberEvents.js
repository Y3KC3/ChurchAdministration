const { Notification } = require('electron');
const db = require('../../database');

async function getMembers(win, id, order, search) {
    if (order === undefined || order === null) {
        const membersInformation = (id === undefined || id === null)
            ? await db.query('SELECT * FROM member INNER JOIN fullnamemember AS full ON full.id = member.id_fullnamemember ORDER BY member.id DESC')
            : await db.query('SELECT * FROM member INNER JOIN fullnamemember AS full ON full.id = member.id_fullnamemember WHERE member.id = ?', id);
        (id === undefined || id === null) ? win.webContents.send('members', membersInformation) : win.webContents.send('memberObtained', membersInformation);
    } else {
        if (order === 'SEARCH') {
            const membersFound = await db.query(`SELECT * FROM member INNER JOIN fullnamemember AS full ON full.id = member.id_fullnamemember WHERE MATCH (full.nameAbbreviation) AGAINST (?) ORDER BY full.nameAbbreviation ASC`, search);
            win.webContents.send('members', membersFound);
            return;
        };
        if (order === 'Ordenar Por Fecha De Registro Descendente') {
            const descendingRegister = await db.query('SELECT * FROM member INNER JOIN fullnamemember AS full ON full.id = member.id_fullnamemember ORDER BY member.id DESC');
            win.webContents.send('members', descendingRegister);
            return;
        };
        if (order === 'Ordenar Por Fecha De Registro Ascendente') {
            const ascendingRegister = await db.query('SELECT * FROM member INNER JOIN fullnamemember AS full ON full.id = member.id_fullnamemember ORDER BY member.id ASC');
            win.webContents.send('members', ascendingRegister);
            return;
        };
        if (order === 'Ordenar Ascendentemente Por El Abecedario') {
            const ascendingAlphabet = await db.query('SELECT * FROM member INNER JOIN fullnamemember AS full ON full.id = member.id_fullnamemember ORDER BY full.nameAbbreviation ASC');
            win.webContents.send('members', ascendingAlphabet);
            return;
        };
        if (order === 'Ordenar Descendentemente Por El Abecedario') {
            const descendingAlphabet = await db.query('SELECT * FROM member INNER JOIN fullnamemember AS full ON full.id = member.id_fullnamemember ORDER BY full.nameAbbreviation DESC');
            win.webContents.send('members', descendingAlphabet);
            return;
        };
        if (order === 'Ordenar Por La Mayor Edad') {
            const ascendingAge = await db.query('SELECT * FROM member INNER JOIN fullnamemember AS full ON full.id = member.id_fullnamemember WHERE member.age > 0 ORDER BY member.age DESC');
            win.webContents.send('members', ascendingAge);
            return;
        };
        if (order === 'Ordenar Por La Menor Edad') {
            const descendingAge = await db.query('SELECT * FROM member INNER JOIN fullnamemember AS full ON full.id = member.id_fullnamemember WHERE member.age > 0 ORDER BY member.age ASC');
            win.webContents.send('members', descendingAge);
            return;
        };
        if (order === 'Ordenar Por Integrantes Familiares Ascendente') {
            const ascendingfamilyMembers = await db.query('SELECT * FROM member INNER JOIN fullnamemember AS full ON full.id = member.id_fullnamemember WHERE member.familyMembers > 0 ORDER BY member.familyMembers ASC');
            win.webContents.send('members', ascendingfamilyMembers);
            return;
        };
        if (order === 'Ordenar Por Integrantes Familiares Descendente') {
            const descendingAlphabet = await db.query('SELECT * FROM member INNER JOIN fullnamemember AS full ON full.id = member.id_fullnamemember WHERE member.familyMembers > 0 ORDER BY member.familyMembers DESC');
            win.webContents.send('members', descendingAlphabet);
            return;
        };
        if (order === 'Ordenar Por Estados De Consolidacion Activa') {
            const activeDiscipleship = await db.query('SELECT * FROM member INNER JOIN fullnamemember AS full ON full.id = member.id_fullnamemember WHERE member.discipleship = true ORDER BY member.id DESC');
            win.webContents.send('members', activeDiscipleship);
            return;
        };
        if (order === 'Ordenar Por Estados De Consolidacion Inactiva') {
            const inactiveDiscipleship = await db.query('SELECT * FROM member INNER JOIN fullnamemember AS full ON full.id = member.id_fullnamemember WHERE member.discipleship = false ORDER BY member.id DESC');
            win.webContents.send('members', inactiveDiscipleship);
            return;
        };
        if (order === 'Ordenar Por Estados Activos De Creyentes') {
            const beliverStatusActive = await db.query('SELECT * FROM member INNER JOIN fullnamemember AS full ON full.id = member.id_fullnamemember WHERE member.beliverStatus = "Activo"');
            win.webContents.send('members', beliverStatusActive);
            console.log(beliverStatusActive);
            return;
        };
        if (order === 'Ordenar Por Estados Pasivos De Creyentes') {
            const beliverStatusInactive = await db.query('SELECT * FROM member INNER JOIN fullnamemember AS full ON full.id = member.id_fullnamemember WHERE member.beliverStatus = "Pasivo"');
            win.webContents.send('members', beliverStatusInactive);
            return;
        };
        if (order === 'Ordenar Por Estados Suspendidos De Creyentes') {
            const beliverStatusDiscontinued = await db.query('SELECT * FROM member INNER JOIN fullnamemember AS full ON full.id = member.id_fullnamemember WHERE member.beliverStatus = "suspendido"');
            win.webContents.send('members', beliverStatusDiscontinued);
            return;
        };
        if (order === 'Ordenar Por Cargos') {
            const orderFotCharge = await db.query('SELECT * FROM member INNER JOIN fullnamemember AS full ON full.id = member.id_fullnamemember ORDER BY member.churchCharge DESC');
            win.webContents.send('members', orderFotCharge);
            return;
        };
        if (order === 'getEmails') {
            const emails = await db.query('SELECT member.id, full.nameAbbreviation, member.email FROM member INNER JOIN fullnamemember AS full ON full.id = member.id_fullnamemember WHERE member.email != "" ORDER BY full.nameAbbreviation ASC');
            win.webContents.send('emailsObtined', emails);
            return;
        };
    };
};

async function saveMember(recharge, member) {
    const fullNameResult = await db.query('INSERT INTO fullnamemember SET ?', [member[0]]);
    member[1].id_fullnamemember = fullNameResult.insertId;
    await db.query('INSERT INTO member SET ?', [member[1]]);

    recharge.reload();

    new Notification({
        title: "Administracion De Iglesia",
        body: `${member[0].nameAbbreviation} Ha Sido ${(member[1].sex == 'Hombre') ? 'Guardado' : 'Guardada'} Satisfactoriamente`
    }).show();
};

async function updateMember(recharge, memberUpdated) {
    await db.query('UPDATE fullnamemember SET ? WHERE id = ?', [memberUpdated[0], memberUpdated[2]]);
    await db.query('UPDATE member SET ? WHERE id = ?', [memberUpdated[1], memberUpdated[2]])

    recharge.reload();

    new Notification({
        title: "Administracion De Iglesia",
        body: `${memberUpdated[0].nameAbbreviation} Ha Sido ${memberUpdated[1].sex == 'Hombre' ? 'Cambiado' : 'Cambiada'} Satisfactoriamente`
    }).show();
};

async function removeM(id) {
    let discipleshipVerification = await db.query('SELECT discipleship FROM member WHERE id = ?', id);
    discipleshipVerification = discipleshipVerification[0].discipleship;

    if (discipleshipVerification === 1) {
        let idDiscipleship = await db.query('SELECT * FROM discipleship WHERE member_id = ?',id);
        idDiscipleship = idDiscipleship[0].id_discipleship;

        let idPerson = await db.query('SELECT * FROM consolidationPerson WHERE discipleship_id = ?', idDiscipleship);

        if (idPerson.length !== 0) {
            idPerson = idPerson[0].person_id;
            await db.query('DELETE FROM consolidationPerson WHERE discipleship_id = ?', idDiscipleship);

            const consolidationRelation = await db.query('SELECT * FROM consolidationPerson WHERE person_id = ?',idPerson);
	        if (consolidationRelation.length == 0) {
		        await db.query('DELETE FROM personprocess WHERE person_id = ?',idPerson);
		        await db.query('DELETE FROM person WHERE id = ?',idPerson);
	        };
        };
        
        await db.query('DELETE FROM assistance_discipleship WHERE discipleship_id = ?',idDiscipleship);
        await db.query('DELETE FROM discipleship WHERE id_discipleship = ?', idDiscipleship);
    };

    await db.query('DELETE FROM member WHERE id = ?', id);
    await db.query('DELETE FROM fullnamemember WHERE id = ?', id);
};

async function removeMember(recharge, id) {
    let awaitSeconds = id.length;
    const memberName = await db.query('SELECT nameAbbreviation FROM fullnamemember WHERE id = ?', id);
    id.forEach(id => removeM(id));

    setTimeout(() => {
        recharge.reload();
        new Notification({
            title: "Administracion De Iglesia",
            body: (id.length > 1) ? 'Los Miembros Han Sido Borrado Satisfactoriamente' : `${memberName[0].nameAbbreviation} Ha sido Eliminado Del Registro`
        }).show();
    }, awaitSeconds * 800);
};

module.exports = {
    saveMember,
    getMembers,
    updateMember,
    removeMember,
};