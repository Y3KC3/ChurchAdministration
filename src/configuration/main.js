const { BrowserWindow, Menu, ipcMain, app, Notification, ipcRenderer } = require('electron');
const db = require('../database');
const Alert = require('electron-alert');
const { saveMember, getMembers, removeMember, updateMember } = require('./events/memberEvents');
const { saveFinance, getFinances, getOneFinance, updateFinance, removeFinance } = require('./events/financeEvents');
const { getDiscipleshipMembers,
		getMembersAvailableToAddToDiscipleship,
		getOneMembersOfDiscipleship,
	    addMemberForDiscipleship,
	    removeDiscipleshipMembers,
	    rollCallToMembers,
	    getListRegister,
		getListToEdit,
		updateRollCall,
		removeList } = require('./events/discipleshipEvents');
const { getConsolidationPerson, addPerson, updatePerson, getSpecificConsolidation, removeConsolidationPerson } = require('./events/consolidationEvents');
const { getOneConsolidationProcess, getConsolidationProcess, getResponsiblePeople, addProcess, updateProcess, removeProcess } = require('./events/processEvents');

let software, addMember, addFinance, addPersonToConsolidation, addProcessToPerson, welcome, authentication, configuration;
let windowCloseValidation = false;

/*const templateMenu = [
	{
		label: 'Inicio'
	},
	{
		label: 'Administracion'
	},
	{
		label: 'Herramientas'
	},
	{
		label: 'Ayuda'
	}
];

const mainMenu = Menu.buildFromTemplate(templateMenu);
Menu.setApplicationMenu(mainMenu);*/

function mainSoftwareWindow (){
	software = new BrowserWindow({
		width: 1200,
		height: 900,
		minHeight: 600,
		minWidth: 1000,
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false,
			enableRemoteModule: true,
		},
		show: false
	});
	software.once('ready-to-show', () => { software.show() });
	software.on('closed', () => { 
		windowCloseValidation = true;
		app.quit() 
	});
	software.loadFile('src/public/html/index.html');
};

function addMemberWindow() {
    addMember = new BrowserWindow({
        width: '900',
        height: '900',
        resizable: false,
        minimizable: false,
        maximizable: false,
        fullscreenable: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true
        },
		parent: software,
    });
    /*addMember.setMenu(null);*/
    addMember.on('closed', () => { if (!windowCloseValidation) { software.setIgnoreMouseEvents(false) }});
    addMember.loadFile('src/public/html/eventWindows/addMember.html');
};

function addFinaceWindow(){
	addFinance = new BrowserWindow({
		width: '900',
        height: '900',
        resizable: false,
        minimizable: false,
        maximizable: false,
        fullscreenable: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true
        },
		parent: software,
	});
    /*addMember.setMenu(null);*/
	addFinance.on('closed', () => { if(!windowCloseValidation) { software.setIgnoreMouseEvents(false) }});
	addFinance.loadFile('src/public/html/eventWindows/addFinance.html');
};

function addPersonToConsolidationWindow (){
	addPersonToConsolidation = new BrowserWindow({
		width: '900',
        height: '900',
        resizable: false,
        minimizable: false,
        maximizable: false,
        fullscreenable: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true
        },
		parent: software,
	});
    /*addMember.setMenu(null);*/
	addPersonToConsolidation.on('closed', () => { if(!windowCloseValidation) { software.setIgnoreMouseEvents(false) }});
	addPersonToConsolidation.loadFile('src/public/html/eventWindows/addPersonToConsolidation.html');
};

function addProcessToPersonWindow (){
	addProcessToPerson = new BrowserWindow({
		width: '900',
        height: '900',
        resizable: false,
        minimizable: false,
        maximizable: false,
        fullscreenable: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true
        },
		parent: software,
	});
    /*addMember.setMenu(null);*/
	addProcessToPerson.on('closed', () => { if(!windowCloseValidation) { software.setIgnoreMouseEvents(false) }});
	addProcessToPerson.loadFile('src/public/html/eventWindows/addPersonProcess.html');
};

function welcomeWindow (){
	welcome = new BrowserWindow({
		width: 1200,
		height: 900,
		minHeight: 600,
		minWidth: 1000,
		webPreferences: {
			nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true
		}
	});

	welcome.setMenu(null);

	welcome.loadFile('src/public/html/welcome.html');
};

function mainConfigurationWindow (){
	configuration = new BrowserWindow ({
		width: 1200,
		height: 900,
		minHeight: 600,
		minWidth: 1000,
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false,
			enableRemoteModule: true
		}
	});

	configuration.setMenu(null);

	configuration.loadFile('src/public/html/configuration.html');
};

function authenticationWindow (){
	authentication = new BrowserWindow({
		width: 1200,
		height: 900,
		minHeight: 600,
		minWidth: 1000,
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false,
			enableRemoteModule: true
		}
	});

	authentication.setMenu(null),

	authentication.loadFile('src/public/html/authentication.html');
};

ipcMain.on('activeWelcomeButton', e => {
	mainConfigurationWindow();
	welcome.close();
});

ipcMain.on('configurationFinished', e => {
	mainSoftwareWindow();
	configuration.close();
});

ipcMain.on('activeToAddMember', () => { 
	software.setIgnoreMouseEvents(true);
	addMemberWindow();
});

ipcMain.on('activeToAddFiance', () => {
	software.setIgnoreMouseEvents(true);
	addFinaceWindow();
});

ipcMain.handle('getMembers', (e,id) => { getMembers(software,id) });
ipcMain.handle('orderMembers', (e,order) => { getMembers(software,null,order) });
ipcMain.handle('lookingForMembers', (e,search) => { getMembers(software,null,'SEARCH',search) });
ipcMain.handle('getOneMemberForUpdate', (e,id) => { 
	addMemberWindow();
	software.setIgnoreMouseEvents(true);
	setTimeout(() => { getMembers(addMember,id) },1500);
});

ipcMain.on('addMember', (e,member) => { 
	saveMember(software,member);
	software.webContents.send('loading');
	software.setIgnoreMouseEvents(false);
	addMember.close();
});

ipcMain.on('updateMember', (e,member) => {
	software.webContents.send('loading');
	updateMember(software,member);
	software.setIgnoreMouseEvents(false);
	addMember.close();
});

ipcMain.on('removeMember', (e,id) => {
	let memberAlert = new Alert();
    let swalOptions = {
        title: "¿Estas Seguro?",
        text: (id.length <= 1) ? "El Miembro A Eliminar No Podra Ser Recuperado Ni Los Datos Relacionados" : "Los Miembros A Eliminar No Podran Ser Recuperados Ni Los Datos Relacionados",
        icon: "warning",
        showCancelButton: true,
    };
    const response = memberAlert.fireWithFrame(swalOptions, 'Eliminar Miembro', null, false);
    response.then(result => { 
    	if (result.value) { 
    		removeMember(software,id) 
    		software.webContents.send('loading');
    	} else { software.webContents.send('cancel') };
    });
});

ipcMain.handle('getFinances', () => { getFinances(software) });
ipcMain.handle('orderFinances', (e,order) => { getFinances(software,null,order) });
ipcMain.handle('lookingForFinances', (e,search) => { getFinances(software,null,'SEARCH',search) });
ipcMain.handle('getOneFinanceForUpdate', (e,id) => {
	addFinaceWindow();
	software.setIgnoreMouseEvents(true);
	setTimeout(() => { getFinances(addFinance,id) },1500);
});
ipcMain.handle('getOneFinance', (e,id) => { getOneFinance(software,id) });

ipcMain.on('addFinance', (e,member) => {
	software.webContents.send('loading');
	saveFinance(software,member)
	software.setIgnoreMouseEvents(false);
	addFinance.close();
});

ipcMain.on('updateFinance', (e,finance) => {
	software.webContents.send('loading');
	updateFinance(software,finance);
	software.setIgnoreMouseEvents(false);
	addFinance.close();
});

ipcMain.on('removeFinance', (e,id) => {
	let financeAlert = new Alert();
    let swalOptions = {
        title: "¿Estas Seguro?",
        text: (id.length <= 1) ? "El Registro A Eliminar No Podran Ser Recuperados" : "Los Registros A Eliminar No Podran Ser Recuperados",
        icon: "warning",
        showCancelButton: true,
    };
    const response = financeAlert.fireWithFrame(swalOptions, 'Eliminar Registro', null, false);
    response.then(result => { 
    	if (result.value) { 
    		removeFinance(software,id) 
    		software.webContents.send('loading');
    	} else { software.webContents.send('cancel') };
    });
});

ipcMain.handle('getDiscipleshipMembers', (e,to) => { getDiscipleshipMembers((to == 'discipleshipMembersToTakeResponsibility') ? addPersonToConsolidation : software,to) });
ipcMain.handle('getMembersAvailableToAddToDiscipleship', () => { getMembersAvailableToAddToDiscipleship(software) });
ipcMain.handle('getOneMembersOfDiscipleship', (e,id) => { getOneMembersOfDiscipleship(software,id) });
ipcMain.handle('addMemberForDiscipleship', (e,member) => { addMemberForDiscipleship(software,member) });
ipcMain.handle('orderDiscipleship', (e,order) => getDiscipleshipMembers(software,null,order));
ipcMain.handle('lookingForDiscipleship', (e,search) => getDiscipleshipMembers(software,null,'SEARCH',search))

ipcMain.on('removeDiscipleshipMembers', (e,id) => {
	let discipleshipAlert = new Alert();
    let swalOptions = {
        title: "¿Estas Seguro?",
        text: (id[0].length <= 1) ? "El Registro A Eliminar No Podra Ser Recuperado Ni Los Datos Relacionados" : "Los Registros A Eliminar No Podran Ser Recuperados Ni Los Datos Relacionados",
        icon: "warning",
        showCancelButton: true,
    };
    const response = discipleshipAlert.fireWithFrame(swalOptions, 'Eliminar Registro', null, false);
    response.then(result => { 
    	if (result.value) { 
    		removeDiscipleshipMembers(software,id) 
    		software.webContents.send('loading');
    	} else { software.webContents.send('cancel') };
    });
});

/*consolidation*/
ipcMain.on('addPerson', (e,personData) => {
	addPerson(software,personData[0],personData[1]);
	software.webContents.send('loading');
	software.setIgnoreMouseEvents(false);
	addPersonToConsolidation.close();
});
ipcMain.handle('getSpecificConsolidation', (e,id) => { getSpecificConsolidation(software,id) });
ipcMain.handle('getOneConsolidatinPersonForUpdate', (e,id) => { 
	addPersonToConsolidationWindow();
	software.setIgnoreMouseEvents(true);
	setTimeout(() => { getConsolidationPerson(addPersonToConsolidation,id) },1500);
});

ipcMain.on('activeToAddPersonToConsolidation', (e,id) => { 
	software.setIgnoreMouseEvents(true);
	addPersonToConsolidationWindow();
	setTimeout(() => { addPersonToConsolidation.webContents.send('excludeDiscipleshipMember',id) },2000);
});

ipcMain.on('removeConsolidationPerson', (e,ids) => {
	let consolidationPersonAlert = new Alert();
    let swalOptions = {
        title: "¿Estas Seguro?",
        text: (ids.length <= 1) ? "La Persona De Consolidacion A Eliminar No Podran Ser Recuperados Ni Los Datos Del Proceso De Consolidacion De La Persona" : "Las Personas A Eliminar No Podran Ser Recuperados Ni Los Datos Del Proceso De Consolidacion De Las Personas",
        icon: "warning",
        showCancelButton: true,
    };
    const response = consolidationPersonAlert.fireWithFrame(swalOptions, 'Eliminar Registro', null, false);
    response.then(result => { 
    	if (result.value) { 
    		removeConsolidationPerson(software,ids[0],ids[1]); 
    		software.webContents.send('loading');
    	} else { software.webContents.send('cancel') };
    });
});

ipcMain.on('updatePerson', (e,personData) => {
	software.webContents.send('loading');
	updatePerson(software,personData[0],personData[1],personData[2]);
	software.setIgnoreMouseEvents(false);
	addPersonToConsolidation.close();
});

/*------------*/

/*process*/

ipcMain.handle('getProcess', (e,ids) => { getConsolidationProcess(software,ids[0],ids[1]) });
ipcMain.handle('getOneProcess', (e,id) => { getOneConsolidationProcess(software,id) });
ipcMain.handle('getResponsiblePeopleToProcess', (e,id) => { getResponsiblePeople(addProcessToPerson,id) });
ipcMain.on('activateWindowToAddProcess', (e,id) => {
	software.setIgnoreMouseEvents(true);
	addProcessToPersonWindow();
	setTimeout(() => { addProcessToPerson.webContents.send('idPerson',id) },2000);
});

ipcMain.on('addProcess', (e,personData) => {
	addProcess(software,personData);
	software.webContents.send('loading');
	software.setIgnoreMouseEvents(false);
	addProcessToPerson.close();
});

ipcMain.on('removePersonProcess', (e,ids) => {
	let consolidationProcessAlert = new Alert();
    let swalOptions = {
        title: "¿Estas Seguro?",
        text: (ids.length <= 1) ? "El Proceso A Eliminar No Podran Ser Recuperados" : "Los Procesos A Eliminar No Podran Ser Recuperados",
        icon: "warning",
        showCancelButton: true,
    };
    const response = consolidationProcessAlert.fireWithFrame(swalOptions, 'Eliminar Registro', null, false);
    response.then(result => { 
    	if (result.value) { 
    		removeProcess(software,ids); 
    		software.webContents.send('loading');
    	} else { software.webContents.send('cancel') };
    });
});

ipcMain.handle('getOneConsolidatinProcessForUpdate', (e,ids) => { 
	addProcessToPersonWindow();
	software.setIgnoreMouseEvents(true);
	setTimeout(() => { getOneConsolidationProcess(addProcessToPerson,ids[0],ids[1]) },1500);
});

ipcMain.on('updateProcess', (e,processData) => {
	software.webContents.send('loading');
	updateProcess(software,processData[0],processData[1]);
	software.setIgnoreMouseEvents(false);
	addProcessToPerson.close();
});

/*-----Show List------*/

ipcMain.on('rollCall', async (e,id) => {
	let validation;

	let lastDate = await db.query('SELECT creationDate FROM assistance_discipleship ORDER BY creationDate DESC');
	if (lastDate.length !== 0) {
		lastDate = lastDate[0].creationDate;
    	lastDate = `${lastDate.getFullYear()}-${lastDate.getMonth() + 1}-${lastDate.getDate()}`

    	let currentDate = new Date();
    	currentDate = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}`;

    	if (currentDate !== lastDate) validation = true
    	else validation = false;
	} else { validation = true };

    if (validation) {
    	let assistanceAlert = new Alert();
    	let swalOptions = {
        	title: "¿Estas Seguro?",
        	text: '¿Quieres Pasar La Lista?, Si Acepta No Podras Cancelarlo',
        	icon: "warning",
        	showCancelButton: true,
    	};
    	const response = assistanceAlert.fireWithFrame(swalOptions, 'Pasar Lista', null, false);
    	response.then(result => { 
    		if (result.value) { 
    			rollCallToMembers(software,id) 
    			software.webContents.send('loading');
    		} else { software.webContents.send('cancelRollCall') };
    	});
    } else { 
    	software.webContents.send('errorRollCall');
    	new Notification({
            title: "Administracion De Iglesia",
            body: 'No Se Puede Pasar La Lista Mas De 2 Veces Por Dia, Por Favor Disculpe Las Molestias, Para Solucionarlo Edite O Borre El Registro Mas Reciente.'
        }).show();
    };
});

ipcMain.on('updateRollCall', (e,datas) => {
	let assistanceUpdateAlert = new Alert();
    let swalOptions = {
        title: "¿Estas Seguro?",
        text: '¿Quieres Actualizar La Lista?, Si Acepta No Podras Cancelarlo',
        icon: "warning",
        showCancelButton: true,
    };
    const response = assistanceUpdateAlert.fireWithFrame(swalOptions, 'Editar Lista', null, false);
    response.then(result => { 
    	if (result.value) { 
    		updateRollCall(software,datas) 
    		software.webContents.send('loading');
    	} else { software.webContents.send('cancelRollCall') };
	});
});

ipcMain.on('removeList', (e,date) => {
	let day = date.getDate();
	let month = date.getMonth();
	let year = date.getFullYear();
	let assistanceRemoveAlert = new Alert();
    let swalOptions = {
        title: "¿Estas Seguro?",
        text: `¿Quieres Borrar La Lista ( ${day}-${month+1}-${year} )?, Los Datos A Borrar No Podran Ser Recuperados.`,
        icon: "warning",
        showCancelButton: true,
    };
    const response = assistanceRemoveAlert.fireWithFrame(swalOptions, 'Editar Lista', null, false);
    response.then(result => { 
    	if (result.value) { 
    		removeList(software,date) 
    		software.webContents.send('loading');
    	};
	});
})

ipcMain.handle('getListRegister', () => getListRegister(software));
ipcMain.handle('getListToEdit', (e,date) => getListToEdit(software,date));

module.exports = {
	welcomeWindow,
	authenticationWindow,
	mainConfigurationWindow,
	mainSoftwareWindow,
};