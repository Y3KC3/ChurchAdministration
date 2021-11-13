const { Notification } = require('electron');
const db = require('../../database');

async function getOneConsolidationProcess (win,idProcess,idPerson){
	const process = await db.query('SELECT * FROM personProcess WHERE id = ?',idProcess);
    win.webContents.send('processObtined',[process,idPerson])
};

async function getConsolidationProcess (win,idPerson,idDiscipleship){
    const discipleshipMemberName = await db.query('SELECT * FROM discipleship AS d INNER JOIN member As m ON d.member_id = m.id INNER JOIN fullnamemember AS f ON m.id_fullnamemember = f.id WHERE d.id_discipleship = ?',idDiscipleship);
    const personName = await db.query('SELECT name FROM person WHERE id = ?',idPerson);
    const personProcess = await db.query('SELECT * FROM personProcess AS pe WHERE pe.person_id = ?',idPerson);

    (personProcess.length === 0)
        ? personProcess.push({ nameAbbreviation: discipleshipMemberName[0].nameAbbreviation, personName: personName[0].name, idDiscipleship, idPerson })
        : personProcess[0].nameAbbreviation = discipleshipMemberName[0].nameAbbreviation, 
          personProcess[0].personName = personName[0].name, 
          personProcess[0].idDiscipleship = idDiscipleship, 
          personProcess[0].idPerson = idPerson;


    win.webContents.send('process',personProcess);
};

async function getResponsiblePeople (win,id) {
    const people = await db.query('SELECT nameAbbreviation FROM consolidationPerson AS c INNER JOIN discipleship AS d ON d.id_discipleship = c.discipleship_id INNER JOIN member As m ON d.member_id = m.id INNER JOIN fullnamemember AS f ON m.id_fullnamemember = f.id WHERE c.person_id = ? ',id);
    win.webContents.send('peopleObtined',people);
};

async function addProcess (recharge,process){
    await db.query('INSERT INTO personProcess SET ?', process);

    recharge.reload();

    new Notification({
        title: "Administracion De Iglesia",
        body: `Se Ha Guardado El Proceso Satisfactoriamente`,
    }).show();
};

async function updateProcess (recharge,processData,id){
    await db.query('UPDATE personProcess SET ? WHERE id = ?',[processData,id]);
    
    setTimeout(() => {
		recharge.reload();

    	new Notification({
        	title: "Administracion De Iglesia",
        	body: `El Proceso Ha Sido Actualizado Satisfactoriamente`,
    	}).show();
	},1500);
};

async function remove (id) { await db.query('DELETE FROM personProcess WHERE id = ?',id) };

async function removeProcess (recharge,ids) {
    let awaitSeconds = ids.length;
    ids.forEach(id => remove(id));

    setTimeout(() => {
        recharge.reload();
        new Notification({
            title: "Administracion De Iglesia",
            body: (ids.length > 1) ? 'Los Procesos Han Sido Eliminados Satisfactoriamente' : `El Proceso Ha sido Eliminado Del Registro`
        }).show();
    }, awaitSeconds * 800);
};

module.exports = {
    getOneConsolidationProcess,
    getConsolidationProcess,
    getResponsiblePeople,
    addProcess,
    updateProcess,
    removeProcess
};