const { Notification } = require('electron');
const db = require('../../database');

async function getDiscipleshipMembers (win,to,order,search){
    if (order == null, order == undefined) {
        const discipleshipMembers = await db.query(`SELECT * FROM discipleship AS d INNER JOIN member AS m ON m.id = d.member_id INNER JOIN fullnamemember AS f ON f.id = m.id_fullnamemember ORDER BY ${(to == 'discipleshipMembersToTakeResponsibility') ? 'f.nameAbbreviation ASC' : 'd.id_discipleship DESC'}`);    
        win.webContents.send('discipleshipMembers',discipleshipMembers);
    } else {
        if (order === 'SEARCH') {
            const discipleshipMemberFound = await db.query(`SELECT * FROM discipleship AS d INNER JOIN member AS m ON m.id = d.member_id INNER JOIN fullnamemember AS f ON f.id = m.id_fullnamemember WHERE MATCH (f.nameAbbreviation) AGAINST (?) ORDER BY d.id_discipleship DESC`, search);
            win.webContents.send('discipleshipMembers', discipleshipMemberFound);
            return;
        }
        if (order === 'Ordenar Por Orden De Registro Descendente') {
            const descendingRegister = await db.query(`SELECT * FROM discipleship AS d INNER JOIN member AS m ON m.id = d.member_id INNER JOIN fullnamemember AS f ON f.id = m.id_fullnamemember ORDER BY d.id_discipleship DESC`);    
            win.webContents.send('discipleshipMembers',descendingRegister);
            return;
        };
        if (order === 'Ordenar Por Orden De Registro Ascendente') {
            const ascendingRegister = await db.query(`SELECT * FROM discipleship AS d INNER JOIN member AS m ON m.id = d.member_id INNER JOIN fullnamemember AS f ON f.id = m.id_fullnamemember ORDER BY d.id_discipleship ASC`);    
            win.webContents.send('discipleshipMembers',ascendingRegister);
            return;
        };
        if (order === 'Ordenar Ascendentemente Por El Abecedario') {
            const ascendingName = await db.query(`SELECT * FROM discipleship AS d INNER JOIN member AS m ON m.id = d.member_id INNER JOIN fullnamemember AS f ON f.id = m.id_fullnamemember ORDER BY f.nameAbbreviation ASC`);    
            win.webContents.send('discipleshipMembers',ascendingName);
            return;
        };
        if (order === 'Ordenar Descendentemente Por El Abecedario') {
            const descendingName = await db.query(`SELECT * FROM discipleship AS d INNER JOIN member AS m ON m.id = d.member_id INNER JOIN fullnamemember AS f ON f.id = m.id_fullnamemember ORDER BY f.nameAbbreviation DESC`);    
            win.webContents.send('discipleshipMembers',descendingName);
            return;
        };
        if (order === 'Ordenar Por Cantidad De Consolidacion Ascendente') {
            const ascendingConsolidationNumber = await db.query(`SELECT * FROM discipleship AS d INNER JOIN member AS m ON m.id = d.member_id INNER JOIN fullnamemember AS f ON f.id = m.id_fullnamemember ORDER BY d.consolidationPersonCount ASC`);    
            win.webContents.send('discipleshipMembers',ascendingConsolidationNumber);
            return;
        };
        if (order === 'Ordenar Por Cantidad De Consolidacion Descendente') {
            const descendingConsolidationNumber = await db.query(`SELECT * FROM discipleship AS d INNER JOIN member AS m ON m.id = d.member_id INNER JOIN fullnamemember AS f ON f.id = m.id_fullnamemember ORDER BY d.consolidationPersonCount DESC`);    
            win.webContents.send('discipleshipMembers',descendingConsolidationNumber);
            return;
        };
        if (order === 'Ordenar Por Cantidad De Asistencia Ascendente') {
            const ascendingAssistanceNumber = await db.query(`SELECT * FROM discipleship AS d INNER JOIN member AS m ON m.id = d.member_id INNER JOIN fullnamemember AS f ON f.id = m.id_fullnamemember ORDER BY d.assistance ASC`);    
            win.webContents.send('discipleshipMembers',ascendingAssistanceNumber);
            return;
        };
        if (order === 'Ordenar Por Cantidad De Asistencia Descendente') {
            const descendingAssistanceNumber = await db.query(`SELECT * FROM discipleship AS d INNER JOIN member AS m ON m.id = d.member_id INNER JOIN fullnamemember AS f ON f.id = m.id_fullnamemember ORDER BY d.assistance DESC`);    
            win.webContents.send('discipleshipMembers',descendingAssistanceNumber);
            return;
        };
        if (order === 'Ordenar Solo Por Los Que Estan Consolidando') {
            const justConsolidating = await db.query(`SELECT * FROM discipleship AS d INNER JOIN member AS m ON m.id = d.member_id INNER JOIN fullnamemember AS f ON f.id = m.id_fullnamemember WHERE d.consolidationPersonCount > 0 ORDER BY d.id_discipleship DESC`);    
            win.webContents.send('discipleshipMembers',justConsolidating);
            return;
        };
        if (order === 'Ordenar Solo Por Los Que No Estan Consolidando') {
            const noConsolidating = await db.query(`SELECT * FROM discipleship AS d INNER JOIN member AS m ON m.id = d.member_id INNER JOIN fullnamemember AS f ON f.id = m.id_fullnamemember WHERE d.consolidationPersonCount = 0 ORDER BY d.id_discipleship DESC`);    
            win.webContents.send('discipleshipMembers',noConsolidating);
            return;
        };
    };
};

async function getOneMembersOfDiscipleship (win,id){
    const discipleshipmemberData = await db.query('SELECT * FROM discipleship AS d INNER JOIN member AS m ON m.id = d.member_id INNER JOIN fullnamemember AS f ON f.id = m.id_fullnamemember WHERE id_discipleship = ?', id);
    win.webContents.send('memberInformation',discipleshipmemberData);
};

async function getMembersAvailableToAddToDiscipleship (win){
    const membersAvailable = await db.query('SELECT * FROM member INNER JOIN fullnamemember AS full ON full.id = member.id_fullnamemember WHERE member.discipleship = false ORDER BY full.nameAbbreviation ASC');
    win.webContents.send('membersAvailable',membersAvailable);
};

async function addMemberForDiscipleship (recharge,member) {
    await db.query('UPDATE member SET discipleship = true WHERE id = ?', member.member_id);
    await db.query('INSERT INTO discipleship SET ?',member);
    const memberName = await db.query('SELECT * FROM member INNER JOIN fullnamemember AS full ON full.id = member.id_fullnamemember WHERE member.id = ?',member.member_id);

    recharge.reload();

    new Notification({
        title: "Administracion De Iglesia",
        body: `${memberName[0].nameAbbreviation} Ha Sido ${(memberName[0].sex === 'Hombre') ? 'Guardado' : 'Guardada'} Satisfactoriamente En El Discipulado`,
    }).show();
};

async function removeD(id,key) {
    if (key === 'MainKey') { 
        let idPerson = await db.query('SELECT * FROM consolidationPerson WHERE discipleship_id = ?', id);
        
        if (idPerson.length !== 0) {
            idPerson = idPerson[0].person_id;
            await db.query('DELETE FROM consolidationPerson WHERE discipleship_id = ?', idDiscipleship);

            const consolidationRelation = await db.query('SELECT * FROM consolidationPerson WHERE person_id = ?',idPerson);
	        if (consolidationRelation.length == 0) {
		        await db.query('DELETE FROM personprocess WHERE person_id = ?',idPerson);
		        await db.query('DELETE FROM person WHERE id = ?',idPerson);
	        };
        };
        
        await db.query('DELETE FROM assistance_discipleship WHERE discipleship_id = ?',id);
        await db.query('DELETE FROM discipleship WHERE id_discipleship = ?', id);
        await db.query('UPDATE member SET discipleship = false WHERE id = ?', id);
    };
    if (key === 'MemberKey') await db.query('UPDATE member SET discipleship = false WHERE id = ?', id);
};

async function removeDiscipleshipMembers(recharge, id) {
    let awaitSeconds = id[0].length;
    const memberName = await db.query('SELECT * FROM member INNER JOIN fullnamemember AS f ON f.id = member.id_fullnamemember WHERE member.id = ?', id[1]);
    id[1].forEach(id => removeD(id,'MemberKey'));
    id[0].forEach(id => removeD(id,'MainKey'));

    setTimeout(() => {
        recharge.reload();
        new Notification({
            title: "Administracion De Iglesia",
            body: (id[0].length > 1) ? 'Los Registros Han Sido Eliminados Satisfactoriamente' : `${memberName[0].nameAbbreviation} Ha sido ${(memberName[0].sex == 'Hombre') ? 'Eliminado' : 'Eliminada'} Del Registro`
        }).show();
    }, awaitSeconds * 800);
};

async function rollCall(id) { 
    let assistances = await db.query('SELECT * FROM assistance_discipleship WHERE discipleship_id = ?',id);
    let count = 0;
    assistances.forEach(assistance => { if (assistance.verification === 1) count ++ });

    await db.query('UPDATE discipleship SET assistance = ? WHERE id_discipleship = ?', [count,id]);
};

let assistanceDate;

async function assistance (id){
    let currentDate = new Date();

    assistanceDate = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}`;

    const assistanceStructure = {
        discipleship_id: id.id_discipleship,
        verification: false,
        creationDate: assistanceDate
    };
    await db.query('INSERT INTO assistance_discipleship SET ?',assistanceStructure);
};

async function rollCallToMembers(recharge,id) {
    let awaitSeconds = id.length;

    const records = await db.query('SELECT id_discipleship FROM discipleship');
    records.forEach(id => assistance(id));

    setTimeout(() => {
        id.forEach(async id => {
            await db.query('UPDATE assistance_discipleship SET verification = true WHERE (discipleship_id = ?) AND (creationDate = ?)',[id,assistanceDate]);
        }
    )}, 500);

    setTimeout(() => id.forEach(id => rollCall(id)),awaitSeconds * 700);

    setTimeout(() => {
        recharge.reload();
        new Notification({
            title: "Administracion De Iglesia",
            body: 'Se Ha Pasado La Lista Con Exito'
        }).show();
    }, awaitSeconds * 1000);
};

async function getListRegister (win) {
    const list = await db.query('SELECT ad.discipleship_id, ad.verification, f.nameAbbreviation, ad.creationDate FROM assistance_discipleship AS ad INNER JOIN discipleship AS d ON d.id_discipleship = ad.discipleship_id INNER JOIN member AS m ON m.id = d.member_id INNER JOIN fullnamemember AS f ON f.id = m.id_fullnamemember ORDER BY ad.creationDate DESC, ad.discipleship_id DESC');

    win.webContents.send('listRegisterObtined',list);
};

async function getListToEdit (win,date) {
    const assistance = await db.query('SELECT * FROM assistance_discipleship WHERE creationDate = ?',date);
    const discipleshipMembers = await db.query(`SELECT d.assistance, d.consolidationPersonCount, d.id_discipleship, f.nameAbbreviation FROM discipleship AS d INNER JOIN member AS m ON m.id = d.member_id INNER JOIN fullnamemember AS f ON f.id = m.id_fullnamemember INNER JOIN assistance_discipleship AS ad ON ad.discipleship_id = d.id_discipleship WHERE ad.creationDate = ? ORDER BY d.id_discipleship DESC`,date);
    win.webContents.send('editDiscipleshipAssistance',[discipleshipMembers,assistance]);
};

async function updateRollCall (recharge,datas) {
    let awaitSeconds = datas.ids.length;
    const ids = datas.ids;

    await db.query('UPDATE assistance_discipleship SET verification = false WHERE creationDate = ?',datas.date);

    ids.forEach(async id => await db.query('UPDATE assistance_discipleship SET verification = true WHERE (discipleship_id = ?) AND (creationDate = ?)',[id,datas.date]));

    const idDiscipleship = await db.query('SELECT id_discipleship FROM discipleship');
    setTimeout(() => idDiscipleship.forEach(id => rollCall(id.id_discipleship)),600);

    setTimeout(() => {
        recharge.reload();
        new Notification({
            title: "Administracion De Iglesia",
            body: 'Se Ha Actualizado La Lista Con Exito'
        }).show();
    }, awaitSeconds * 1000);
};

async function removeList (recharge,date) {
    await db.query('DELETE FROM assistance_discipleship WHERE creationDate = ?',date);
    
    const idDiscipleship = await db.query('SELECT id_discipleship FROM discipleship');
    setTimeout(() => idDiscipleship.forEach(id => rollCall(id.id_discipleship)),600);
    
    setTimeout(() => {
        recharge.reload();
        new Notification({
            title: "Administracion De Iglesia",
            body: 'Se Ha Eliminado La Lista Con Exito'
        }).show();
    },1200);
};

module.exports = {
    getDiscipleshipMembers,
    getOneMembersOfDiscipleship,
    getMembersAvailableToAddToDiscipleship,
    addMemberForDiscipleship,
    removeDiscipleshipMembers,
    rollCallToMembers,
    getListRegister,
    getListToEdit,
    updateRollCall,
    removeList
};