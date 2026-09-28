
const STORAGE_KEY = "znaedu_school_control_30_v3";

const defaultState = {
  school: {
    name: "",
    year: "2026-2027",
    manager: ""
  },
  classes: [],
  learners: [],
  teachers: [],
  assignments: [],
  attendance: []
};

let state = loadState();

function createId(prefix) {
  return (
    prefix +
    "_" +
    Date.now() +
    "_" +
    Math.random().toString(36).slice(2, 8)
  );
}

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return structuredClone(defaultState);
    }

    const parsed = JSON.parse(saved);

    return {
      ...structuredClone(defaultState),
      ...parsed,

      school: {
        ...defaultState.school,
        ...(parsed.school || {})
      },

      classes: Array.isArray(parsed.classes)
        ? parsed.classes
        : [],

      learners: Array.isArray(parsed.learners)
        ? parsed.learners
        : [],

      teachers: Array.isArray(parsed.teachers)
        ? parsed.teachers
        : [],

      assignments: Array.isArray(parsed.assignments)
        ? parsed.assignments
        : [],

      attendance: Array.isArray(parsed.attendance)
        ? parsed.attendance
        : []
    };

  } catch (error) {
    return structuredClone(defaultState);
  }
}

function saveState() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(state)
  );
}

function getElement(id) {
  return document.getElementById(id);
}


/* INITIALISATION */

document.addEventListener("DOMContentLoaded", () => {

  setupNavigation();

  setupSchoolForm();

  setupClassManagement();

  setupLearnerManagement();

  setupTeacherManagement();

  setupAssignments();

  setupAttendance();

  renderAll();
});


/* NAVIGATION */

function setupNavigation() {

  const buttons =
    document.querySelectorAll(".nav-btn");

  buttons.forEach(button => {

    button.addEventListener("click", () => {

      const sectionId =
        button.dataset.section;

      document
        .querySelectorAll(".nav-btn")
        .forEach(btn =>
          btn.classList.remove("active")
        );

      document
        .querySelectorAll(".section")
        .forEach(section =>
          section.classList.remove("active")
        );

      button.classList.add("active");

      const section =
        getElement(sectionId);

      if (section) {
        section.classList.add("active");
      }
    });
  });
}


/* ETABLISSEMENT */

function setupSchoolForm() {

  getElement("schoolForm")
    .addEventListener("submit", event => {

      event.preventDefault();

      state.school.name =
        getElement("schoolName")
          .value
          .trim();

      state.school.year =
        getElement("schoolYear")
          .value
          .trim();

      state.school.manager =
        getElement("schoolManager")
          .value
          .trim();

      saveState();

      renderAll();

      alert(
        "Les informations de l'établissement ont été enregistrées."
      );
    });
}


/* CLASSES */

function setupClassManagement() {

  getElement("addClassBtn")
    .addEventListener("click", () => {

      getElement("classForm").reset();

      getElement("classDialog").showModal();
    });


  getElement("classForm")
    .addEventListener("submit", event => {

      event.preventDefault();

      const name =
        getElement("className")
          .value
          .trim();

      if (!name) {
        return;
      }

      const exists =
        state.classes.some(
          classroom =>
            classroom.name.toLowerCase() ===
            name.toLowerCase()
        );

      if (exists) {

        alert(
          "Cette classe existe déjà."
        );

        return;
      }

      state.classes.push({

        id: createId("class"),

        name

      });

      saveState();

      getElement("classDialog").close();

      renderAll();
    });
}


function renderClasses() {

  const container =
    getElement("classList");

  container.innerHTML = "";

  if (state.classes.length === 0) {

    container.innerHTML = `
      <div class="empty">
        Aucune classe n'a encore été créée.
      </div>
    `;

    return;
  }


  state.classes.forEach(classroom => {

    const learnerCount =
      state.learners.filter(
        learner =>
          learner.classId === classroom.id
      ).length;


    const card =
      document.createElement("div");

    card.className = "class-card";


    card.innerHTML = `

      <h3>
        ${escapeHtml(classroom.name)}
      </h3>

      <p>
        ${learnerCount} apprenant(s)
      </p>

      <div class="card-actions">

        <button
          class="delete-btn"
          data-delete-class="${classroom.id}"
        >
          Supprimer
        </button>

      </div>

    `;


    container.appendChild(card);
  });


  container
    .querySelectorAll("[data-delete-class]")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const classId =
            button.dataset.deleteClass;


          const learners =
            state.learners.filter(
              learner =>
                learner.classId === classId
            );


          if (learners.length > 0) {

            alert(
              "Impossible de supprimer cette classe : elle contient encore des apprenants."
            );

            return;
          }


          state.classes =
            state.classes.filter(
              classroom =>
                classroom.id !== classId
            );


          state.assignments =
            state.assignments.filter(
              assignment =>
                assignment.classId !== classId
            );


          saveState();

          renderAll();
        }
      );
    });
}


/* APPRENANTS */

function setupLearnerManagement() {

  getElement("addLearnerBtn")
    .addEventListener("click", () => {

      if (state.classes.length === 0) {

        alert(
          "Crée d'abord au moins une classe."
        );

        return;
      }


      getElement("learnerForm").reset();

      fillClassSelect("learnerClass");

      getElement("learnerDialog")
        .showModal();
    });


  getElement("learnerForm")
    .addEventListener("submit", event => {

      event.preventDefault();


      const matricule =
        getElement("learnerMatricule")
          .value
          .trim();


      const lastName =
        getElement("learnerLastName")
          .value
          .trim();


      const firstName =
        getElement("learnerFirstName")
          .value
          .trim();


      const classId =
        getElement("learnerClass")
          .value;


      if (
        !matricule ||
        !lastName ||
        !firstName ||
        !classId
      ) {
        return;
      }


      state.learners.push({

        id: createId("learner"),

        matricule,

        lastName,

        firstName,

        classId

      });


      saveState();

      getElement("learnerDialog")
        .close();

      renderAll();
    });


  getElement("learnerClassFilter")
    .addEventListener(
      "change",
      renderLearners
    );


  getElement("learnerSearch")
    .addEventListener(
      "input",
      renderLearners
    );
}


function fillClassSelect(
  selectId,
  includeEmpty = false
) {

  const select =
    getElement(selectId);

  if (!select) {
    return;
  }


  const previous =
    select.value;


  select.innerHTML = "";


  if (includeEmpty) {

    const option =
      document.createElement("option");

    option.value = "";

    option.textContent =
      "Toutes les classes";

    select.appendChild(option);
  }


  state.classes.forEach(classroom => {

    const option =
      document.createElement("option");

    option.value =
      classroom.id;

    option.textContent =
      classroom.name;

    select.appendChild(option);
  });


  if (
    previous &&
    state.classes.some(
      classroom =>
        classroom.id === previous
    )
  ) {

    select.value = previous;
  }
}


function getClassName(classId) {

  const classroom =
    state.classes.find(
      classroom =>
        classroom.id === classId
    );

  return classroom
    ? classroom.name
    : "Classe supprimée";
}


function renderLearners() {

  const tbody =
    getElement("learnerTableBody");

  tbody.innerHTML = "";


  const filterClass =
    getElement(
      "learnerClassFilter"
    ).value;


  const search =
    getElement(
      "learnerSearch"
    )
      .value
      .trim()
      .toLowerCase();


  let learners =
    [...state.learners];


  if (filterClass) {

    learners =
      learners.filter(
        learner =>
          learner.classId === filterClass
      );
  }


  if (search) {

    learners =
      learners.filter(learner => {

        const text = [

          learner.matricule,

          learner.lastName,

          learner.firstName,

          getClassName(
            learner.classId
          )

        ]
          .join(" ")
          .toLowerCase();


        return text.includes(search);
      });
  }


  if (learners.length === 0) {

    tbody.innerHTML = `

      <tr>

        <td
          colspan="5"
          class="empty"
        >
          Aucun apprenant trouvé.
        </td>

      </tr>

    `;

    return;
  }


  learners.forEach(learner => {

    const row =
      document.createElement("tr");


    row.innerHTML = `

      <td>
        ${escapeHtml(
          learner.matricule
        )}
      </td>

      <td>
        ${escapeHtml(
          learner.lastName
        )}
      </td>

      <td>
        ${escapeHtml(
          learner.firstName
        )}
      </td>

      <td>
        ${escapeHtml(
          getClassName(
            learner.classId
          )
        )}
      </td>

      <td>

        <button
          class="delete-btn"
          data-delete-learner="${learner.id}"
        >
          Supprimer
        </button>

      </td>

    `;


    tbody.appendChild(row);
  });


  tbody
    .querySelectorAll(
      "[data-delete-learner]"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const id =
            button.dataset.deleteLearner;


          state.learners =
            state.learners.filter(
              learner =>
                learner.id !== id
            );


          state.attendance =
            state.attendance.filter(
              record =>
                record.learnerId !== id
            );


          saveState();

          renderAll();
        }
      );
    });
}


/* ENSEIGNANTS */

function setupTeacherManagement() {

  getElement("addTeacherBtn")
    .addEventListener("click", () => {

      getElement("teacherForm").reset();

      getElement("teacherDialog")
        .showModal();
    });


  getElement("teacherForm")
    .addEventListener("submit", event => {

      event.preventDefault();


      const lastName =
        getElement("teacherLastName")
          .value
          .trim();


      const firstName =
        getElement("teacherFirstName")
          .value
          .trim();


      const subject =
        getElement("teacherSubject")
          .value
          .trim();


      if (
        !lastName ||
        !firstName ||
        !subject
      ) {
        return;
      }


      state.teachers.push({

        id: createId("teacher"),

        lastName,

        firstName,

        subject

      });


      saveState();

      getElement("teacherDialog")
        .close();

      renderAll();
    });
}


function renderTeachers() {

  const tbody =
    getElement("teacherTableBody");

  tbody.innerHTML = "";


  if (state.teachers.length === 0) {

    tbody.innerHTML = `

      <tr>

        <
