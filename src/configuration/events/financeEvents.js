const { Notification } = require('electron');
const db = require('../../database');

async function getFinances(win, id, order,search) {
    if (order === undefined || order === null) {
        const finances = (id === null || id === undefined)
            ? await db.query('SELECT * FROM finance ORDER BY id DESC')
            : await db.query('SELECT * FROM finance WHERE id = ?', id);
        (id === null || id === undefined) ? win.webContents.send('finances', finances) : win.webContents.send('financeObtained', finances);
    } else {
        if (order === 'SEARCH') {
            const financesFound  = await db.query(`SELECT * FROM finance WHERE MATCH (finance.name) AGAINST (?) ORDER BY finance.name ASC`, search);
            win.webContents.send('finances', financesFound);
            return;
        };
        if (order === 'Ordenar Por Fecha De Registro Descendente') {
            const descendingRegister  = await db.query(`SELECT * FROM finance ORDER BY id DESC`);
            win.webContents.send('finances', descendingRegister);
            return;
        };
        if (order === 'Ordenar Por Fecha De Registro Ascendente') {
            const ascendingRegister  = await db.query(`SELECT * FROM finance ORDER BY id ASC`);
            win.webContents.send('finances', ascendingRegister);
            return;
        };
        if (order === 'Ordenar Por Nombre Ascencendemente') {
            const ascendingName  = await db.query(`SELECT * FROM finance ORDER BY name ASC`);
            win.webContents.send('finances', ascendingName);
            return;
        };
        if (order === 'Ordenar Por Nombre Descendemente') {
            const descendingName  = await db.query(`SELECT * FROM finance ORDER BY name DESC`);
            win.webContents.send('finances', descendingName);
            return;
        };
        if (order === 'Ordenar Por Mayor Cantidad Ingresada') {
            const greaterAmountEntered  = await db.query(`SELECT * FROM finance WHERE finance.dataType = 'Ingreso' ORDER BY amount DESC`);
            win.webContents.send('finances', greaterAmountEntered);
            return;
        };
        if (order === 'Ordenar Por Mayor Cantidad Egresada') {
            const greaterAmountGraduated  = await db.query(`SELECT * FROM finance WHERE finance.dataType = 'Egreso' ORDER BY amount DESC`);
            win.webContents.send('finances', greaterAmountGraduated);
            return;
        };
        if (order === 'Ordenar Por Menor Cantidad Ingresada') {
            const leastAmountEntered  = await db.query(`SELECT * FROM finance WHERE finance.dataType = 'Ingreso' ORDER BY amount ASC`);
            win.webContents.send('finances', leastAmountEntered);
            return;
        };
        if (order === 'Ordenar Por Menor Cantidad Egresada') {
            const leastAmountGraduated  = await db.query(`SELECT * FROM finance WHERE finance.dataType = 'Egreso' ORDER BY amount ASC`);
            win.webContents.send('finances', leastAmountGraduated);
            return;
        };
    };
};

async function getOneFinance(win, id) { 
    const finance = await db.query('SELECT * FROM finance WHERE id = ?', id);
    win.webContents.send('financeInformation', finance);
};

async function saveFinance(recharge, finance) {
    await db.query('INSERT INTO finance SET ?', finance);

    recharge.reload();

    new Notification({
        title: "Administracion De Iglesia",
        body: `${finance.name} Ha Sido Guardado Satisfactoriamente`,
    }).show();
};

async function updateFinance(recharge, finance) {
    await db.query('UPDATE finance SET ? WHERE id = ?', [finance[0], finance[1]]);

    recharge.reload();

    new Notification({
        title: "Administracion De Iglesia",
        body: `${finance[0].name} Ha Sido Actualizado Satisfactoriamente`
    }).show();
};

async function removeF(id) { await db.query('DELETE FROM finance WHERE id = ?', id) };

async function removeFinance(recharge, id) {
    let awaitSeconds = id.length;
    const financeName = await db.query('SELECT * FROM finance WHERE id = ?', id);
    id.forEach(id => removeF(id));

    setTimeout(() => {
        recharge.reload();
        new Notification({
            title: "Administracion De Iglesia",
            body: (id.length > 1) ? 'Los Registros Han Sido Eliminados Satisfactoriamente' : `${financeName[0].name} Ha sido Eliminado Del Registro`
        }).show();
    }, awaitSeconds * 800);
};


module.exports = {
    getFinances,
    getOneFinance,
    saveFinance,
    updateFinance,
    removeFinance
};