const { Notification } = require('electron');
const db = require('../../database');

async function getConsolidationPerson (win,id){
	const person = await db.query('SELECT * FROM person WHERE id = ?',id);
	const personConsolidation = await db.query('SELECT * FROM consolidationPerson AS c INNER JOIN discipleship  AS d ON c.discipleship_id = d.id_discipleship INNER JOIN member AS m ON d.member_id = m.id INNER JOIN fullnamemember AS f ON m.id_fullnamemember = f.id WHERE person_id = ?',id);
	win.webContents.send('personObtined',[person,personConsolidation]);
};

async function syncConsolidationPersonCount () {
	const discipleshipMembers = await db.query('SELECT * FROM discipleship');
	discipleshipMembers.forEach(async discipleshipMember => {
		const id = discipleshipMember.id_discipleship;
		const discipleshipData = await db.query('SELECT * FROM consolidationPerson WHERE discipleship_id = ?',id);
		await db.query('UPDATE discipleship SET consolidationPersonCount = ? WHERE id_discipleship = ?',[discipleshipData.length,id]);
	});
};

async function syncPeopleToDiscipleship (discipleshipId,personId) {
	const union = { person_id: personId, discipleship_id: discipleshipId };
	await db.query('INSERT INTO consolidationPerson SET ?',union);
	syncConsolidationPersonCount();
};

async function addPerson (recharge,personData,ids) {
	const awaitSeconds = ids.length;
	const person = await db.query('INSERT INTO person SET ?',personData);
	await ids.forEach(id => syncPeopleToDiscipleship(id,person.insertId));

	setTimeout(() => {
		recharge.reload();

    	new Notification({
        	title: "Administracion De Iglesia",
        	body: `${personData.name} Has Sido Agregado Satisfactoriamente`,
    	}).show();
	},awaitSeconds * 800);
};

async function updatePerson (recharge,personData,ids,idToUpdate) {
	const awaitSeconds = ids.length;
	await db.query('UPDATE person SET ? WHERE id = ?',[personData,idToUpdate]);
	await db.query('DELETE FROM consolidationPerson WHERE person_id = ?',idToUpdate);

	ids.forEach(id => syncPeopleToDiscipleship(id,idToUpdate));

	setTimeout(() => {
		recharge.reload();

    	new Notification({
        	title: "Administracion De Iglesia",
        	body: `${personData.name} Has Sido Actualizado Satisfactoriamente`,
    	}).show();
	},awaitSeconds * 1500);
};

async function getSpecificConsolidation (win,id) {
	let memberName = await db.query('SELECT * FROM discipleship AS d INNER JOIN member AS m ON m.id = d.member_id INNER JOIN fullnamemember AS f ON f.id = m.id_fullnamemember WHERE id_discipleship = ?', id);
	const personConsolidating = await db.query('SELECT * FROM consolidationPerson AS c INNER JOIN person AS p ON c.person_id = p.id WHERE discipleship_id = ? ORDER BY c.person_id DESC',id);	
	memberName = memberName[0].nameAbbreviation;

	(personConsolidating.length === 0)
		? personConsolidating.push({ nameAbbreviation: memberName })
		: personConsolidating[0].nameAbbreviation = memberName;

	win.webContents.send('consolidationPeopleObtined', personConsolidating);
};

async function removeRelation (idPerson,idDiscipleship) {
	await db.query('DELETE FROM consolidationPerson WHERE (discipleship_id = ?) AND (person_id = ?)',[idDiscipleship,idPerson]);

	const consolidationRelation = await db.query('SELECT * FROM consolidationPerson WHERE person_id = ?',idPerson);
	if (consolidationRelation.length == 0) {
		await db.query('DELETE FROM personprocess WHERE person_id = ?',idPerson);
		await db.query('DELETE FROM person WHERE id = ?',idPerson);
	};
}

async function removeConsolidationPerson (recharge,idsPersons,idDiscipleship) {
	let awaitSeconds = idsPersons.length;
    const consolidationPersonName = await db.query('SELECT * FROM person WHERE id = ?', idsPersons[0]);
    idsPersons.forEach(id => removeRelation(id,idDiscipleship));

	let discipleshipData = await db.query('SELECT * FROM discipleship WHERE id_discipleship = ?', idDiscipleship);
	const count = discipleshipData[0].consolidationPersonCount -= idsPersons.length;
	await db.query('UPDATE discipleship SET consolidationPersonCount = ? WHERE id_discipleship = ?',[count,idDiscipleship]);

    setTimeout(() => {
        recharge.reload();
        new Notification({
            title: "Administracion De Iglesia",
            body: (idsPersons.length > 1) ? 'Las Personas Han Sido Eliminadas Satisfactoriamente' : `${consolidationPersonName[0].name} Ha sido Eliminado Satisfactoriamente`
        }).show();
    }, awaitSeconds * 800);
};

module.exports = {
	getConsolidationPerson,
	addPerson,
	updatePerson,
	getSpecificConsolidation,
	removeConsolidationPerson,
};