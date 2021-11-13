const { ipcRenderer } = require('electron');

const firstName = document.getElementById('name');
const secondName = document.getElementById('secondName');
const lastName = document.getElementById('lastName');
const secondSurname = document.getElementById('secondSurname');
const nameAbbreviation = document.getElementById('nameAbbreviation');
const sex = document.getElementById('sex');
const phoneNumber = document.getElementById('phoneNumber');
const identification = document.getElementById('identification');
const dateOfBirth = document.getElementById('dateOfBirth');
const age = document.getElementById('age');
const address = document.getElementById('address');
const familyMembers = document.getElementById('familyMembers');
const familyRelationship = document.getElementById('familyRelationship');
const professionJob = document.getElementById('professionJob');
const email = document.getElementById('email');
const christeningDate = document.getElementById('christeningDate');
const beliverStatus = document.getElementById('beliverStatus');
const churchCharge = document.getElementById('churchCharge');
const description = document.getElementById('biography');

const inputCharge = document.querySelector('.inputCharge');
const inputfamilyRelationship = document.querySelector('.familyRelationship');

let editing = false;
let id;

const getDateForUpdate = (date) => {
    let getDay = date.getDate();
    let getMonth = date.getMonth();
    const getYear = date.getFullYear();

    if (getMonth == 0) getMonth += 1;
    if (getMonth < 10) getMonth = "0" + getMonth;
    if (getDay < 10) getDay = "0" + getDay;

    return `${getYear}-${getMonth}-${getDay}`;
};

ipcRenderer.on('memberObtained', (e,data) => {
    editing = true;
    data = data[0];
    id = data.id

    if (data.familyRelationship !== 'Hij@' && 
        data.familyRelationship !== 'Herman@' &&
        data.familyRelationship !== 'Padre/Madre' &&
        data.familyRelationship !== 'Abuel@' &&
        data.familyRelationship !== 'Ñiet@' && 
        data.familyRelationship !== 'Ti@' &&
        data.familyRelationship !== 'Prim@' &&
        data.familyRelationship !== 'Sobrin@') { 
            familyRelationship.value = 'Otro';
            inputfamilyRelationship.classList.replace('inactive','active');
            inputfamilyRelationship.value = data.familyRelationship;
        } else { familyRelationship.value = data.familyRelationship };

    if (data.churchCharge !== 'Miembro' && 
        data.churchCharge !== 'Siervo' &&
        data.churchCharge !== 'Obrer@' &&
        data.churchCharge !== 'Limpieza' &&
        data.churchCharge !== 'Cociner@' && 
        data.churchCharge !== 'Lider' &&
        data.churchCharge !== 'Musico' &&
        data.churchCharge !== 'Danza') { 
            churchCharge.value = 'Ninguno De Los Anteriores';
            inputCharge.classList.replace('inactive','active');
            inputCharge.value = data.churchCharge ;
        } else { churchCharge.value = data.churchCharge };
    
    firstName.value = data.name;
    secondName.value = data.secondName;
    lastName.value = data.lastName;
    secondSurname.value = data.secondSurname;
    nameAbbreviation.value = data.nameAbbreviation;
    sex.value = data.sex;
    phoneNumber.value = data.phoneNumber;
    identification.value = data.identification;
    dateOfBirth.value = `${getDateForUpdate(data.dateOfBirth)}`;
    age.value = data.age;
    address.value = data.address;
    familyMembers.value = data.familyMembers;
    professionJob.value = data.professionJob;
    email.value = data.email;
    christeningDate.value = `${getDateForUpdate(data.christeningDate)}`;
    beliverStatus.value = data.beliverStatus; 
    description.value =  data.biography;
});

const send = document.getElementById('send');

churchCharge.addEventListener('change', () => { changeInput(churchCharge.value == 'Ninguno De Los Anteriores',inputCharge) });
familyRelationship.addEventListener('change', () => { changeInput(familyRelationship.value == 'Otro',inputfamilyRelationship) });

const changeInput = (validation,input) => {
    if (validation) { input.classList.replace('inactive','active') } 
    else input.classList.replace('active','inactive');
};

const formValidation = (validation,pClass,text) => {
    if (validation) { document.querySelector(pClass).textContent = text }
    else document.querySelector(pClass).textContent = '';
};

send.addEventListener('click', e => {
    e.preventDefault();

    let dateOfBirthYears = dateOfBirth.value.slice(0,4);
    let yearsInDateofBirthNumbers = parseInt(dateOfBirthYears);

    let christeningDateYears = christeningDate.value.slice(0,4);
    let yearsInNumbersOfchristeningDate = parseInt(christeningDateYears);

    formValidation(firstName.value.length > 15 || firstName.value.length === 1 || firstName.value.length === 2,'.name','El Nombre No Puede Tener Mas De 15 Caracteres, Y No Puede Tener 1 O 2 Digitos');
    formValidation(secondName.value.length > 15 || secondName.value.length === 1 || secondName.value.length === 2,'.secondName','El Segundo Nombre No Puede Tener Mas De 15 Caracteres, Y No Puede Tener 1 O 2 Digitos');
    formValidation(lastName.value.length > 15 || lastName.value.length  === 1 || lastName.value.length  === 2, '.lastName', 'El apellido No Puede Tener Mas De 15 Caracteres, Y No Puede Tener 1 O 2 Digitos');
    formValidation(secondSurname.value.length > 15 || (secondSurname.value.length === 1 || secondSurname.value.length === 2),'.secondSurname','El Segundo Apellido No Puede Tener Mas De 15 Caracteres, Y No Puede Tener 1 O 2 Digitos');
    formValidation(nameAbbreviation.value.length > 30 || nameAbbreviation.value.length <= 2,'.nameAbbreviation','La Abreviacion Del Nombre No Puede Tener Menos De 2 Caracteres Y No Puede Tener Mas De 30 Caracteres');
    formValidation(phoneNumber.value.length > 15,'.phoneNumber','El Numero De Telefono No Puede Tener Mas De 15 Digitos');
    formValidation(identification.value > 1000000000,'.identification','La Cedula De Identificacion No Puede Tener Mas De 1000000000 Digitos');
    formValidation(yearsInDateofBirthNumbers < 1900 || yearsInDateofBirthNumbers > 2022,'.dateOfBirth','Fecha Invalida');
    formValidation(age.value > 120,'.age','No Puede Tener Mas De 120 Años');
    formValidation(address.value.length > 50,'.address','La Direccion  No Puede Tener Mas De 50 Digitos');
    formValidation(familyMembers.value > 20,'.familyMembers','No Puede Tener Mas De 20 Miembros En Una Familia');
    formValidation(professionJob.value.length > 40,'.professionJob','El Trabajo O Oficio No Pueden Tener Mas De 50 Caracteres');
    formValidation(email.value.length > 40,' .email','El Correo Electronico No Puede Tener Mas De 40 Caracteres');
    formValidation(yearsInNumbersOfchristeningDate < 1900 || yearsInNumbersOfchristeningDate > 2022,'.christeningDate','Fecha Invalida');
    formValidation(description.value.length > 2500,'.biographyP','La Biografia Tiene Un Maximo De 2500 Caracteres');
    formValidation(inputCharge.value.length > 40,'.churchChargeP','El Cargo De La Iglesia No Puede Tener Mas De 40 Caracteres');
    formValidation(inputfamilyRelationship.value.length > 40,'.familyRelationshipP','La Relacion De Familia No Puede Tener Mas De 40 Caracteres');

    if (firstName.value.length < 15 && firstName.value.length !== 1 && firstName.value.length !== 2 && secondName.value.length < 15 && secondName.value.length !== 1 && secondName.value.length !== 2 && lastName.value.length < 15 && lastName.value.length  !== 1 && lastName.value.length  !== 2  && secondSurname.value.length < 15 && secondSurname.value.length !== 1 && secondSurname.value.length !== 2 &&  nameAbbreviation.value.length < 30 && nameAbbreviation.value.length > 2 && phoneNumber.value.length < 15 && identification.value < 500000000 && yearsInDateofBirthNumbers < 2022 && yearsInDateofBirthNumbers > 1900 && age.value < 120 && address.value.length < 50 && familyMembers.value < 20 && professionJob.value.length < 40 && email.value.length < 40 && yearsInNumbersOfchristeningDate > 1900 && yearsInNumbersOfchristeningDate < 2022){
        let date = new Date();

        const firstDataObject = {
            name: firstName.value,
            secondName: secondName.value,
            lastName: lastName.value,
            secondSurname: secondSurname.value,
            nameAbbreviation: nameAbbreviation.value
        };

        const secondDataObject = {
            sex: sex.value,
            phoneNumber: phoneNumber.value,
            identification: identification.value,
            dateOfBirth: dateOfBirth.value,
            age: age.value,
            address: address.value,
            familyMembers: familyMembers.value,
            familyRelationship: (familyRelationship.value == 'Otro') ? inputfamilyRelationship.value : familyRelationship.value,
            professionJob: professionJob.value,
            email: email.value,
            christeningDate: christeningDate.value,
            beliverStatus: beliverStatus.value,
            churchCharge: (churchCharge.value == 'Ninguno De Los Anteriores') ? inputCharge.value : churchCharge.value,
            biography: biography.value,
            modificationDate: date,
        };

        if (!editing) { 
            secondDataObject.creationDate = date ;
            secondDataObject.discipleship = false;
        };

        (!editing) 
            ? ipcRenderer.send('addMember',[firstDataObject,secondDataObject])
            : ipcRenderer.send('updateMember',[firstDataObject,secondDataObject,id]);
    };
});