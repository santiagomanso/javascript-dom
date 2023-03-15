// global variable ready to be pushed, filtered and removed.
let patients = []

// main fn Fetch data
const fetchData = async () => {
  //show spinner

  const main = document.getElementById('main') //main content
  const spinnerContainer = document.createElement('div') //create spinner
  spinnerContainer.setAttribute('class', 'd-flex justify-content-center mt-5')
  main.appendChild(spinnerContainer)

  const spinnerBorder = document.createElement('div')
  spinnerBorder.setAttribute('class', 'spinner-border mt-5')
  spinnerBorder.setAttribute('role', 'status')
  spinnerBorder.setAttribute('style', 'width: 10rem; height: 10rem;')
  spinnerContainer.appendChild(spinnerBorder)

  const spinner = document.createElement('span')
  spinner.setAttribute('class', 'sr-only')
  spinner.innerText = 'Loading...'

  spinnerBorder.appendChild(spinner)

  const response = await fetch('https://randomuser.me/api/?results=20')
  const { results } = await response.json()

  const responses = await Promise.all(
    results.map(async (item) => {
      return await fetch('https://randomuser.me/api/').then((response) =>
        response.json(),
      )
    }),
  )
  patients = results.map((item) => {
    return {
      ...item,
      room: randomRoom(),
      diagnosis: randomDiagnosis(),
      actualNurse: randomNurse(responses), //another promise
    }
  })
  console.log('patients', patients)
  controller(patients)
}

const controller = (data) => {
  //display data to DOM
  renderData(data)

  //create HTML options
  createOptions(data)

  addEvents(data)

  //new patient
  const btnNewPatient = document.getElementById('btnNewPatient')
  btnNewPatient.addEventListener('click', (e) => newPatient(e))
}

//fn add event listeners
const addEvents = (data) => {
  //event listeners to new patient gender
  handlerGenderChange()

  //event picture change
  handlerChangePicture()

  //reset new Patient modal inputs
  handlerResetNewPatient()

  //searchInput
  const searchBar = document.getElementById('searchPatient')
  searchBar.disabled = false //enable search
  searchBar.addEventListener('input', (e) => handlerSearch(e))
  searchBar.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
      let name = handlerSearch(e) //return from search function
      data.map((patient) => {
        if (patient.name.last.toLowerCase() === name.toLowerCase()) {
          renderData([patient]) //needs to go as array of 1
        }
        if (patient.name.first.toLowerCase() === name.toLowerCase()) {
          renderData([patient]) //needs to go as array of 1
        }
      })
      searchBar.value = ''
    }
  })

  //add filters to the options
  addFilters(data)
}

const handlerSearch = (e) => {
  let name = ''
  name = name + e.target.value
  return name
}

//create HTML options
const createOptions = (data) => {
  let select = document.getElementById('selectRoom') // HTML select
  select.removeAttribute('disabled')

  //function to return rooms
  const rooms = data.map((patient) => {
    return patient.room
  })
  const uniqueRooms = [...new Set(rooms)]

  uniqueRooms.map((room) => {
    let option = document.createElement('option')
    option.setAttribute('value', `${room}`)
    option.innerText = `Room ${room}`
    select.appendChild(option)
  })
}

//add filters
const addFilters = (data) => {
  const male = document.getElementById('filterCheckMale')
  const female = document.getElementById('filterCheckFemale')
  const diverse = document.getElementById('filterCheckDiverse')
  const all = document.getElementById('filterCheckAll')
  // select all checkboxes at once --> loop over it and add event to each element of the nodelist
  male.removeAttribute('disabled')
  female.removeAttribute('disabled')
  diverse.removeAttribute('disabled')
  all.removeAttribute('disabled')

  male.addEventListener('click', (e) => {
    console.log('e', e)
    female.checked = false
    diverse.checked = false
    all.checked = false
    male.checked = false
    e.target.checked = true
    if (male.checked) {
      filterBy(data)
    }
  })

  female.addEventListener('click', () => {
    male.checked = false
    diverse.checked = false
    all.checked = false
    if (female.checked) {
      filterBy(data)
    }
  })

  diverse.addEventListener('click', () => {
    female.checked = false
    male.checked = false
    all.checked = false
    if (diverse.checked) {
      filterBy(data)
    }
  })

  all.addEventListener('click', () => {
    female.checked = false
    diverse.checked = false
    male.checked = false
    if (all.checked) {
      filterBy(data)
    }
  })

  //rooms
  document
    .querySelector('#selectRoom')
    .addEventListener('change', () => filterBy(data))
}

const filterBy = (data) => {
  let selectedCheckBox = document.querySelector(
    'input[name=gender]:checked',
  ).value
  const optionRoom = document.getElementById('selectRoom').value
  const filteredRooms = data.filter((patient) => {
    return (
      (patient.room === +optionRoom && patient.gender === selectedCheckBox) ||
      (optionRoom === 'all' && patient.gender === selectedCheckBox) ||
      (patient.room === +optionRoom && selectedCheckBox === 'all') ||
      (optionRoom === 'all' && selectedCheckBox === 'all')
    )
  })
  renderData(filteredRooms)
  // console.log('filteredRooms', filteredRooms)
}

// random bed function
const randomRoom = () => {
  return Math.floor(Math.random() * 6 + 1)
}

//random nurse fn
const randomNurse = (responses) => {
  let nurses = []
  responses.map((item, i) => {
    nurses.push(item.results[0].name.first + ' ' + item.results[0].name.last)
  })

  //achievment of 13/12 random index based on the length of the array of names
  return nurses[Math.floor(Math.random() * nurses.length)]
}

//random diagnosis function
const randomDiagnosis = () => {
  const diagnosis = [
    'Mononucleosis',
    'Blunt trauma',
    'Dislocated shoulder',
    'ALS',
    'Parkinsons',
    'Cerebral Aneusysm',
    'Alzheimer',
    "Wilson's",
    'ACL rupture',
    'patellar chondropathy',
    'Gonalgie',
    'Hemorrhagic Shock',
    'L3 - Hernia',
    'Thymoid carninoma',
    'Leukemia',
    'Chemo session #5',
  ]

  return diagnosis[Math.floor(Math.random() * 15)]
}

//render data to DOM (not-modal)
const renderData = (data) => {
  //create html elements - Note: i will use horizontal card component from bootstrap

  let main = document.getElementById('main') //main
  main.innerHTML = '' //html reset
  if (data.length > 0) {
    data.map((patient, i) => {
      let row = document.createElement('div') //row
      row.setAttribute('class', 'row g-0')
      let card = document.createElement('div') // card
      card.setAttribute(
        'class',
        'card mx-2 my-3 rounded-3 animate__animated animate__fadeIn',
      )
      card.setAttribute('style', 'max-width: 400px; overflow:hidden;')

      let leftCol = document.createElement('div') //left column
      leftCol.setAttribute(
        'class',
        'col-4 d-flex justify-items-center align-items-center',
      )

      let rightCol = document.createElement('div') //right column
      rightCol.setAttribute('class', 'col-8')

      let img = document.createElement('img') // img
      img.setAttribute('src', patient.picture.large)
      img.setAttribute('style', 'max-width:130px; max-height: 130px')

      let cardBody = document.createElement('div') //card-body
      cardBody.setAttribute('class', 'card-body px-2 py-5')

      let cardTitle = document.createElement('h5') //card-title
      cardTitle.setAttribute('class', 'card-title')
      cardTitle.innerText = `${patient.name.first} ${patient.name.last}`

      let cardText = document.createElement('p') //card-text
      cardText.setAttribute('class', 'card-text')
      cardText.innerText = `ICU - Room: ${patient.room}`

      let diagnosisDiv = document.createElement('div')
      diagnosisDiv.setAttribute('class', 'd-flex align-items-center')

      let diagnosisIcon = document.createElement('i')
      diagnosisIcon.setAttribute('class', 'fa-solid fa-virus mx-2')
      diagnosisDiv.appendChild(diagnosisIcon)

      let diagnosis = document.createElement('p') //diagnosis
      diagnosis.setAttribute('class', 'card-text')
      diagnosis.innerText = patient.diagnosis
      diagnosisDiv.appendChild(diagnosis)

      if (i % 2 === 0) {
        card.classList.add('class', 'bg-custom2')
      } else {
        card.classList.add('class', 'bg-custom1')
      }

      //appends
      leftCol.appendChild(img) // img => left column
      row.appendChild(leftCol) // left column => row

      cardBody.appendChild(cardTitle) // card-title => card-body
      cardBody.appendChild(cardText) // card-text => card-body
      cardBody.appendChild(diagnosisDiv)

      rightCol.appendChild(cardBody) // card-body => right column

      row.appendChild(rightCol) // right column => row

      card.appendChild(row) // row => card

      main.appendChild(card) // card => main

      card.addEventListener('click', (e) => showData(data[i], e))
    })
  } else {
    let row = document.createElement('div') //row
    row.setAttribute('class', 'row g-0')
    let card = document.createElement('div') // card
    card.setAttribute(
      'class',
      'card mx-2 my-3 rounded-5 animate__animated animate__fadeIn',
    )
    card.setAttribute('style', 'max-width: 350px; overflow:hidden;')

    let leftCol = document.createElement('div') //left column
    leftCol.setAttribute(
      'class',
      'col-4 d-flex justify-items-center align-items-center',
    )

    let rightCol = document.createElement('div') //right column
    rightCol.setAttribute('class', 'col-8')

    let img = document.createElement('img') // img
    img.setAttribute('src', data[0].picture.large)
    img.setAttribute('style', 'max-width:150px; max-height: 150px')

    let cardBody = document.createElement('div') //card-body
    cardBody.setAttribute('class', 'card-body px-4 py-5')

    let cardTitle = document.createElement('h5') //card-title
    cardTitle.setAttribute('class', 'card-title')
    cardTitle.innerText = `${data[0].name.first} ${data[0].name.last}`

    let cardText = document.createElement('p') //card-text
    cardText.setAttribute('class', 'card-text')
    cardText.innerText = `ICU - Room: ${data[0].room}`

    let diagnosis = document.createElement('p') //diagnosis
    diagnosis.setAttribute('class', 'card-text')
    diagnosis.innerText = data[0].diagnosis

    //appends
    leftCol.appendChild(img) // img => left column
    row.appendChild(leftCol) // left column => row

    cardBody.appendChild(cardTitle) // card-title => card-body
    cardBody.appendChild(cardText) // card-text => card-body
    cardBody.appendChild(diagnosis)

    rightCol.appendChild(cardBody) // card-body => right column

    row.appendChild(rightCol) // right column => row

    card.appendChild(row) // row => card

    main.appendChild(card) // card => main

    card.addEventListener('click', (e) => showData(data[0], e))

    //show all button
    let row2 = document.createElement('div') //row
    row2.setAttribute('class', 'row g-0')
    let card2 = document.createElement('div') // card
    card2.setAttribute(
      'class',
      'card mx-2 my-3 rounded-5 animate__animated animate__fadeIn',
    )
    card2.setAttribute('style', 'max-width: 350px; overflow:hidden;')

    let leftCol2 = document.createElement('div') //left column
    leftCol2.setAttribute(
      'class',
      'col-4 d-flex justify-items-center align-items-center',
    )

    let rightCol2 = document.createElement('div') //right column
    rightCol2.setAttribute('class', 'col-8')

    let img2 = document.createElement('i') // img
    img2.setAttribute('class', 'fa-solid fa-reply-all fs-1 ps-5')

    let cardBody2 = document.createElement('div') //card-body
    cardBody2.setAttribute('class', 'card-body px-4 py-5')

    let cardTitle2 = document.createElement('h5') //card-title
    cardTitle2.setAttribute('class', 'card-title')
    cardTitle2.innerText = `Back to All patients`

    let cardText2 = document.createElement('p') //card-text
    cardText2.setAttribute('class', 'card-text')
    cardText2.innerText = `click here to display all patients`

    //appends
    leftCol2.appendChild(img2) // img => left column
    row2.appendChild(leftCol2) // left column => row

    cardBody2.appendChild(cardTitle2) // card-title => card-body
    cardBody2.appendChild(cardText2) // card-text => card-body

    rightCol2.appendChild(cardBody2) // card-body => right column

    row2.appendChild(rightCol2) // right column => row

    card2.appendChild(row2) // row => card

    main.appendChild(card2) // card => main

    card2.addEventListener('click', () => fetchData())
  }
}

const handlerChangePicture = () => {
  const inputPicture = document.getElementById('inputPicture')
  let img = document.getElementById('profilePicture')
  inputPicture.addEventListener('change', () => {
    img.src = inputPicture.value
  })
}

const handlerResetNewPatient = () => {
  const btn = document.getElementById('btnCancelNewPatient')
  btn.addEventListener('click', () => {
    //resets values
    document.getElementById('firstName').value = ''
    document.getElementById('lastName').value = ''
    document.getElementById('dob').value = ''
    document.getElementById('phone').value = ''
    document.getElementById('email').value = ''
    document.getElementById('diagnosis').value = ''
    document.getElementById('admitionDate').value = ''
    document.getElementById('room').value = ''
  })
}

const handlerGenderChange = () => {
  //get HTML elements
  //checkboxex
  let male = document.getElementById('checkMale')
  let female = document.getElementById('checkFemale')
  let diverse = document.getElementById('checkDiverse')
  //labels
  let labelMale = document.getElementById('labelMale')
  let labelFemale = document.getElementById('labelFemale')
  let labelDiverse = document.getElementById('labelDiverse')

  male.addEventListener('click', () => {
    female.checked = false
    diverse.checked = false
    labelFemale.setAttribute('class', 'text-muted')
    labelDiverse.setAttribute('class', 'text-muted')
    labelMale.classList.remove('text-muted')
  })
  female.addEventListener('click', () => {
    male.checked = false
    diverse.checked = false
    labelMale.setAttribute('class', 'text-muted')
    labelDiverse.setAttribute('class', 'text-muted')
    labelFemale.classList.remove('text-muted')
  })
  diverse.addEventListener('click', () => {
    female.checked = false
    male.checked = false
    labelFemale.setAttribute('class', 'text-muted')
    labelMale.setAttribute('class', 'text-muted')
    labelDiverse.classList.remove('text-muted')
  })
}

// show modal fn
const showData = (data, e) => {
  let title = document.getElementById('modal-title')
  title.innerText = data.name.first + ' ' + data.name.last
  //get modal
  const modalShow = new bootstrap.Modal('#modalViewPatient')

  //region
  //get modal body
  let modalBody = document.getElementById('modal-body')
  modalBody.innerHTML = ''

  //create view modal
  let nav = document.createElement('nav')
  modalBody.appendChild(nav)

  //nav-tabs div
  let navTabs = document.createElement('div')
  navTabs.setAttribute('class', 'nav nav-tabs')
  navTabs.setAttribute('id', 'viewPatient-nav-tab')
  navTabs.setAttribute('role', 'tablist')
  nav.appendChild(navTabs)

  //nav-tabs buttons general-info
  let btnGeneral = document.createElement('button')
  btnGeneral.setAttribute('class', 'nav-link active')
  btnGeneral.setAttribute('id', 'viewPatient-nav-general-info-tab')
  btnGeneral.setAttribute('data-bs-toggle', 'tab')
  btnGeneral.setAttribute('data-bs-target', '#viewPatient-nav-general-info')
  btnGeneral.setAttribute('type', 'button')
  btnGeneral.setAttribute('role', 'tab')
  btnGeneral.setAttribute('aria-controls', 'viewPatient-nav-general-info')
  btnGeneral.setAttribute('aria-selected', 'true')
  btnGeneral.innerText = '1 - General info'
  navTabs.appendChild(btnGeneral)

  //nav-tabs buttons contact-info
  let btnContactInfo = document.createElement('button')
  btnContactInfo.setAttribute('class', 'nav-link')
  btnContactInfo.setAttribute('id', 'viewPatient-nav-contact-info-tab')
  btnContactInfo.setAttribute('data-bs-toggle', 'tab')
  btnContactInfo.setAttribute('data-bs-target', '#viewPatient-nav-contact-info')
  btnContactInfo.setAttribute('type', 'button')
  btnContactInfo.setAttribute('role', 'tab')
  btnContactInfo.setAttribute('aria-controls', 'viewPatient-nav-contact-info')
  btnContactInfo.setAttribute('aria-selected', 'false')
  btnContactInfo.innerText = '2 - Contact information'
  navTabs.appendChild(btnContactInfo)

  //nav-tabs buttons nav-icu-info-tab
  let btnIcu = document.createElement('button')
  btnIcu.setAttribute('class', 'nav-link')
  btnIcu.setAttribute('id', 'viewPatient-nav-icu-info-tab')
  btnIcu.setAttribute('data-bs-toggle', 'tab')
  btnIcu.setAttribute('data-bs-target', '#viewPatient-nav-icu-info')
  btnIcu.setAttribute('type', 'button')
  btnIcu.setAttribute('role', 'tab')
  btnIcu.setAttribute('aria-controls', 'viewPatient-nav-icu-info')
  btnIcu.setAttribute('aria-selected', 'false')
  btnIcu.innerText = '3 - Intensive care unit'
  navTabs.appendChild(btnIcu)

  //tab-content, goes into modal-body
  let tabContent = document.createElement('div')
  tabContent.setAttribute('class', 'tab-content')
  tabContent.setAttribute('id', 'viewPatient-nav-tabContent')
  modalBody.appendChild(tabContent)

  //---------------------------- TAB CONTENT (general Info) ----------------------------

  //content GENERAL INFO TAB
  let generalInfo = document.createElement('div')
  generalInfo.setAttribute('class', 'tab-pane fade show active p-3')
  generalInfo.setAttribute('id', 'viewPatient-nav-general-info')
  generalInfo.setAttribute('role', 'tabpanel')
  generalInfo.setAttribute(
    'aria-labelledby',
    'viewPatient-nav-general-info-tab',
  )
  tabContent.appendChild(generalInfo) //apend to tabContent

  let rowGeneral = document.createElement('div')
  rowGeneral.setAttribute('class', 'row')
  generalInfo.appendChild(rowGeneral) //append to row

  //LEFT COL general info
  let colGeneralInfoLeft = document.createElement('div')
  colGeneralInfoLeft.setAttribute(
    'class',
    'd-flex flex-column align-items-center col-md-5',
  )
  rowGeneral.appendChild(colGeneralInfoLeft) //append to

  //left header info H5
  let leftHeaderGeneralInfo = document.createElement('h5')
  leftHeaderGeneralInfo.innerText = 'Pacient Information'
  colGeneralInfoLeft.appendChild(leftHeaderGeneralInfo)

  let leftHeaderGeneralInfoText = document.createElement('p')
  leftHeaderGeneralInfoText.setAttribute('class', 'text-muted')
  leftHeaderGeneralInfoText.innerText =
    'Here you will find the contact information of the patient as well as the profile picture, to see room and full diagnosis click on: 3-Intensive Care Unit'
  colGeneralInfoLeft.appendChild(leftHeaderGeneralInfoText)

  let img = document.createElement('img')
  img.setAttribute('src', data.picture.large)
  img.setAttribute('width', '150px')
  img.setAttribute('height', '150px')
  colGeneralInfoLeft.appendChild(img) //img to colGeneralInfoLeft

  // RIGHT COL general info
  let colGeneralInfoRight = document.createElement('div')
  colGeneralInfoRight.setAttribute('class', 'col-md-7')
  rowGeneral.appendChild(colGeneralInfoRight)

  //NAME
  let generalInfoLabelName = document.createElement('label') //label name
  generalInfoLabelName.setAttribute('for', 'firstName')
  generalInfoLabelName.innerHTML = 'First Name'
  colGeneralInfoRight.appendChild(generalInfoLabelName)

  let generalInfoRightDivName = document.createElement('div') //div where input goes
  generalInfoRightDivName.setAttribute('class', 'input-group mb-3')
  colGeneralInfoRight.appendChild(generalInfoRightDivName)

  let GeneralInfoRightInputName = document.createElement('input') //input name
  GeneralInfoRightInputName.setAttribute('type', 'text')
  GeneralInfoRightInputName.setAttribute('id', 'firstName')
  GeneralInfoRightInputName.setAttribute('class', 'form-control') //text muted when viewing ;)
  GeneralInfoRightInputName.disabled = true
  GeneralInfoRightInputName.value = data.name.first
  generalInfoRightDivName.appendChild(GeneralInfoRightInputName)

  //LAST NAME
  let generalInfoLabelLastName = document.createElement('label') //label lastname
  generalInfoLabelLastName.setAttribute('for', 'firstName')
  generalInfoLabelLastName.innerHTML = 'First Name'
  colGeneralInfoRight.appendChild(generalInfoLabelLastName)

  let generalInfoRightDivLastName = document.createElement('div') //div where input goes
  generalInfoRightDivLastName.setAttribute('class', 'input-group mb-3')
  colGeneralInfoRight.appendChild(generalInfoRightDivLastName)

  let GeneralInfoRightInputLastName = document.createElement('input') //input lastName
  GeneralInfoRightInputLastName.setAttribute('type', 'text')
  GeneralInfoRightInputLastName.setAttribute('id', 'lastName')
  GeneralInfoRightInputLastName.setAttribute('class', 'form-control') //text muted when viewing ;)
  GeneralInfoRightInputLastName.disabled = true
  GeneralInfoRightInputLastName.value = data.name.last
  generalInfoRightDivLastName.appendChild(GeneralInfoRightInputLastName)

  //Date of Birth (DOB)
  let generalInfoLabelDOB = document.createElement('label') //label lastname
  generalInfoLabelDOB.setAttribute('for', 'dob')
  generalInfoLabelDOB.innerHTML = 'Date of Birth'
  colGeneralInfoRight.appendChild(generalInfoLabelDOB)

  let generalInfoRightDivDOB = document.createElement('div') //div where input goes
  generalInfoRightDivDOB.setAttribute('class', 'input-group mb-3')
  colGeneralInfoRight.appendChild(generalInfoRightDivDOB)

  let GeneralInfoRightInputDOB = document.createElement('input') //input lastName
  GeneralInfoRightInputDOB.setAttribute('type', 'date')
  GeneralInfoRightInputDOB.setAttribute('id', 'firstName')
  GeneralInfoRightInputDOB.setAttribute('class', 'form-control') //text muted when viewing ;)
  GeneralInfoRightInputDOB.disabled = true
  const stringDate = data.dob.date.split('T')[0] //split take away last part
  GeneralInfoRightInputDOB.setAttribute('value', stringDate) //HOW TO GET DATE HERE  new Date() constructor and parse date??
  generalInfoRightDivDOB.appendChild(GeneralInfoRightInputDOB)

  //gender
  let genderDiv = document.createElement('div')
  genderDiv.setAttribute('class', 'input-group mb-3')
  colGeneralInfoRight.appendChild(genderDiv)

  //male div (input+label)
  let genderDivMale = document.createElement('div') //MALE
  genderDivMale.setAttribute('class', 'form-check form-check-inline')
  genderDiv.appendChild(genderDivMale) //apends to genderDiv
  let genderDivMaleInput = document.createElement('input')
  genderDivMaleInput.setAttribute('class', 'form-check-input')
  genderDivMaleInput.setAttribute('type', 'checkbox')
  genderDivMaleInput.setAttribute('name', 'gender')
  genderDivMaleInput.setAttribute('id', 'checkMale')

  let genderDivMaleLabel = document.createElement('label')
  genderDivMaleLabel.setAttribute('class', 'form-check-label')
  genderDivMaleLabel.setAttribute('for', 'checkMale')
  genderDivMaleLabel.innerText = 'Male'
  genderDivMale.appendChild(genderDivMaleInput)
  genderDivMale.appendChild(genderDivMaleLabel)

  //female div (input + label)
  let genderDivFemale = document.createElement('div') //MALE
  genderDivFemale.setAttribute('class', 'form-check form-check-inline')
  genderDiv.appendChild(genderDivFemale) //apends to genderDiv
  let genderDivFemaleInput = document.createElement('input')
  genderDivFemaleInput.setAttribute('class', 'form-check-input')
  genderDivFemaleInput.setAttribute('type', 'checkbox')
  genderDivFemaleInput.setAttribute('name', 'gender')
  genderDivFemaleInput.setAttribute('id', 'checkMale')

  let genderDivFemaleLabel = document.createElement('label')
  genderDivFemaleLabel.setAttribute('class', 'form-check-label')
  genderDivFemaleLabel.setAttribute('for', 'checkMale')
  genderDivFemaleLabel.innerText = 'Female'
  genderDivFemale.appendChild(genderDivFemaleInput)
  genderDivFemale.appendChild(genderDivFemaleLabel)

  //diverse div (input + label)
  let genderDivDiverse = document.createElement('div') //MALE
  genderDivDiverse.setAttribute('class', 'form-check form-check-inline')
  genderDiv.appendChild(genderDivDiverse) //apends to genderDiv
  let genderDivDiverseInput = document.createElement('input')
  genderDivDiverseInput.setAttribute('class', 'form-check-input')
  genderDivDiverseInput.setAttribute('type', 'checkbox')
  genderDivDiverseInput.setAttribute('name', 'gender')
  genderDivDiverseInput.setAttribute('id', 'checkMale')

  let genderDivDiverseLabel = document.createElement('label')
  genderDivDiverseLabel.setAttribute('class', 'form-check-label')
  genderDivDiverseLabel.setAttribute('for', 'checkMale')
  genderDivDiverseLabel.innerText = 'Diverse'
  genderDivDiverse.appendChild(genderDivDiverseInput)
  genderDivDiverse.appendChild(genderDivDiverseLabel)

  //disable checkboxes and labels for gender, it's done at the end
  //of all the rendering, due to ERROR CAN'T ACCESS BEFORE INITIALIZATIONS
  if (data.gender == 'diverse') {
    genderDivDiverseInput.checked = true
    //set other checkboxes and labels to disable
    genderDivMaleLabel.setAttribute('class', 'text-muted')
    genderDivMaleInput.disabled = true
    genderDivFemaleLabel.setAttribute('class', 'text-muted')
    genderDivFemaleInput.disabled = true
  }
  if (data.gender == 'female') {
    genderDivFemaleInput.checked = true
    //set other checkboxes and labels to disable
    genderDivMaleLabel.setAttribute('class', 'text-muted')
    genderDivMaleInput.disabled = true
    genderDivDiverseLabel.setAttribute('class', 'text-muted')
    genderDivDiverseInput.disabled = true
  }
  if (data.gender == 'male') {
    genderDivMaleInput.checked = true
    //set other checkboxes and labels to disable
    genderDivFemaleLabel.setAttribute('class', 'text-muted')
    genderDivFemaleInput.disabled = true
    genderDivDiverseLabel.setAttribute('class', 'text-muted')
    genderDivDiverseInput.disabled = true
  }

  //---------------------------- TAB CONTENT (contact info) ----------------------------

  //content CONTACT INFORMATION
  //content GENERAL INFO TAB
  let contactInfo = document.createElement('div')
  contactInfo.setAttribute('class', 'tab-pane fade p-3')
  contactInfo.setAttribute('id', 'viewPatient-nav-contact-info')
  contactInfo.setAttribute('role', 'tabpanel')
  contactInfo.setAttribute(
    'aria-labelledby',
    'viewPatient-nav-contact-info-tab',
  )
  tabContent.appendChild(contactInfo) //apend to tabContent

  let rowContactInfo = document.createElement('div')
  rowContactInfo.setAttribute('class', 'row')
  contactInfo.appendChild(rowContactInfo) //append to row

  //LEFT COL CONTACT info
  let colContactInfoLeft = document.createElement('div')
  colContactInfoLeft.setAttribute(
    'class',
    'd-flex flex-column align-items-center col-md-5',
  )
  rowContactInfo.appendChild(colContactInfoLeft) //append to rowContact Info

  //left header info H5
  let leftHeaderContactInfo = document.createElement('h5')
  leftHeaderContactInfo.innerText = 'Contact Information'
  colContactInfoLeft.appendChild(leftHeaderContactInfo)

  let leftHeaderContactInfoText = document.createElement('p')
  leftHeaderContactInfoText.setAttribute('class', 'text-muted')
  leftHeaderContactInfoText.innerText =
    'Display here you will find relevant information to get in touch with the patient, as well as information regarding emergency contact'
  colContactInfoLeft.appendChild(leftHeaderContactInfoText)

  // RIGHT COL general info
  let colContactInfoRight = document.createElement('div')
  colContactInfoRight.setAttribute('class', 'col-md-7')
  rowContactInfo.appendChild(colContactInfoRight)

  //Phone
  let contactLabelPhone = document.createElement('label') //label name
  contactLabelPhone.setAttribute('for', 'phone')
  contactLabelPhone.innerHTML = 'Phone Number'
  colContactInfoRight.appendChild(contactLabelPhone)

  let contactInfoDivPhone = document.createElement('div') //div where input goes
  contactInfoDivPhone.setAttribute('class', 'input-group mb-3')
  colContactInfoRight.appendChild(contactInfoDivPhone)

  let contactInfoRightInputPhone = document.createElement('input') //input name
  contactInfoRightInputPhone.setAttribute('type', 'text')
  contactInfoRightInputPhone.setAttribute('id', 'firstName')
  contactInfoRightInputPhone.setAttribute('class', 'form-control') //text muted when viewing ;)
  contactInfoRightInputPhone.disabled = true
  contactInfoRightInputPhone.value = data.phone
  contactInfoDivPhone.appendChild(contactInfoRightInputPhone)

  //Email
  let contactLabelEmail = document.createElement('label') //label name
  contactLabelEmail.setAttribute('for', 'email')
  contactLabelEmail.innerHTML = 'Patient Email'
  colContactInfoRight.appendChild(contactLabelEmail)

  let contactInfoDivEmail = document.createElement('div') //div where input goes
  contactInfoDivEmail.setAttribute('class', 'input-group mb-3')
  colContactInfoRight.appendChild(contactInfoDivEmail)

  let contactInfoRightInputEmail = document.createElement('input') //input name
  contactInfoRightInputEmail.setAttribute('type', 'text')
  contactInfoRightInputEmail.setAttribute('id', 'firstName')
  contactInfoRightInputEmail.setAttribute('class', 'form-control') //text muted when viewing ;)
  contactInfoRightInputEmail.disabled = true
  contactInfoRightInputEmail.value = data.email
  contactInfoDivEmail.appendChild(contactInfoRightInputEmail)

  //---------------------------- TAB CONTENT (Intensive Care Unit) ----------------------------

  //content ICU
  //content ICU TAB
  let icu = document.createElement('div')
  icu.setAttribute('class', 'tab-pane fade p-3')
  icu.setAttribute('id', 'viewPatient-nav-icu-info')
  icu.setAttribute('role', 'tabpanel')
  icu.setAttribute('aria-labelledby', 'viewPatient-nav-icu-tab')
  tabContent.appendChild(icu) //apend to tabContent

  let rowIcu = document.createElement('div')
  rowIcu.setAttribute('class', 'row')
  icu.appendChild(rowIcu) //append to row

  //LEFT COL CONTACT info
  let colIcuLeft = document.createElement('div')
  colIcuLeft.setAttribute(
    'class',
    'd-flex flex-column align-items-center col-md-5',
  )
  rowIcu.appendChild(colIcuLeft) //append to rowContact Info

  //left header info H5
  let leftHeaderIcu = document.createElement('h5')
  leftHeaderIcu.innerText = 'Intensive Care Unit'
  colIcuLeft.appendChild(leftHeaderIcu)

  let leftHeaderIcuText = document.createElement('p')
  leftHeaderIcuText.setAttribute('class', 'text-muted')
  leftHeaderIcuText.innerText =
    'Relevant information for Health personnel, such as Room number, diagnosis, room temperature and actual nurse'
  colIcuLeft.appendChild(leftHeaderIcuText)

  // RIGHT COL ICU info
  let colIcuRight = document.createElement('div')
  colIcuRight.setAttribute('class', 'col-md-7')
  rowIcu.appendChild(colIcuRight)

  //Diagnosis
  let icuLabelDiagnosis = document.createElement('label') //label name
  icuLabelDiagnosis.setAttribute('for', 'phone')
  icuLabelDiagnosis.innerHTML = 'Actual Diagnosis'
  colIcuRight.appendChild(icuLabelDiagnosis)

  let icuDivDiagnosis = document.createElement('div') //div where input goes
  icuDivDiagnosis.setAttribute('class', 'input-group mb-3')
  colIcuRight.appendChild(icuDivDiagnosis)

  let icuDivDiagnosisInput = document.createElement('input') //input name
  icuDivDiagnosisInput.setAttribute('type', 'text')
  icuDivDiagnosisInput.setAttribute('id', 'firstName')
  icuDivDiagnosisInput.setAttribute('class', 'form-control') //text muted when viewing ;)
  icuDivDiagnosisInput.disabled = true
  icuDivDiagnosisInput.value = data.diagnosis
  icuDivDiagnosis.appendChild(icuDivDiagnosisInput)

  //Room Number
  let icuLabelRoom = document.createElement('label') //label name
  icuLabelRoom.setAttribute('for', 'room')
  icuLabelRoom.innerHTML = 'Room number - Unit number'
  colIcuRight.appendChild(icuLabelRoom)

  let icuDivRoom = document.createElement('div') //div where input goes
  icuDivRoom.setAttribute('class', 'input-group mb-3')
  colIcuRight.appendChild(icuDivRoom)

  let icuDivRoomInput = document.createElement('input') //input name
  icuDivRoomInput.setAttribute('type', 'text')
  icuDivRoomInput.setAttribute('id', 'firstName')
  icuDivRoomInput.setAttribute('class', 'form-control') //text muted when viewing ;)
  icuDivRoomInput.disabled = true
  icuDivRoomInput.value = data.room
  icuDivRoom.appendChild(icuDivRoomInput)

  //Nurse
  let icuNurseLabel = document.createElement('label') //label name
  icuNurseLabel.setAttribute('for', 'nurse')
  icuNurseLabel.innerHTML = 'Actual Nurse'
  colIcuRight.appendChild(icuNurseLabel)

  let icuDivNurse = document.createElement('div') //div where input goes
  icuDivNurse.setAttribute('class', 'input-group mb-3')
  colIcuRight.appendChild(icuDivNurse)

  let icuDivNurseInput = document.createElement('input') //input name
  icuDivNurseInput.setAttribute('type', 'text')
  icuDivNurseInput.setAttribute('id', 'firstName')
  icuDivNurseInput.setAttribute('class', 'form-control') //text muted when viewing ;)
  icuDivNurseInput.disabled = true
  icuDivNurseInput.value = data.actualNurse
  icuDivNurse.appendChild(icuDivNurseInput)

  //show modal
  modalShow.show()
}

//add new patient fn
const newPatient = () => {
  let gender
  let male = document.getElementById('checkMale')
  let female = document.getElementById('checkFemale')
  let diverse = document.getElementById('checkDiverse')
  if (male.checked) {
    gender = 'male'
  }
  if (female.checked) {
    gender = 'male'
  }
  if (diverse.checked) {
    gender = 'male'
  }

  patients.push({
    name: {
      first: document.getElementById('firstName').value,
      last: document.getElementById('lastName').value,
      title: '',
    },
    diagnosis: document.getElementById('diagnosis').value,
    dob: {
      age: 22, //calculation of age (????)
      date: document.getElementById('dob').value,
    },
    gender: gender,
    admitionDate: document.getElementById('admitionDate').value,
    patientEmail: document.getElementById('email').value,
    phone: document.getElementById('phone').value,
    picture: {
      small:
        'https://upload.wikimedia.org/wikipedia/commons/2/2c/Default_pfp.svg',
      medium:
        'https://upload.wikimedia.org/wikipedia/commons/2/2c/Default_pfp.svg',
      large:
        'https://upload.wikimedia.org/wikipedia/commons/2/2c/Default_pfp.svg',
    },
    room: document.getElementById('room').value,
  })
  //close modal rezise
  let modal = new bootstrap.Modal(document.querySelector('#smodalNewPatient'))
  modal.hide()
  renderData(patients.reverse())
}

fetchData()
