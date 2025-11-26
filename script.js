const STUDENTS_DATA = [
    "Isabella García", "Annelis Alzolar", "Franniel Rodriguez", "Laura Fermín", 
    "Rania Cabeza", "Yenny Perdomo", "Gabriela Requena", "Fiorella Colina", 
    "Diego Marín", "Matías Becerra", "Leonardo Portero", "Oliver Josué", 
    "Pablo Navarro", "Samuel Jiménez", "París Elena"
];

// Los valores se almacenan INTERNAMENTE como enteros (multiplicados por 100) para precisión.
const MAX_LIFE = 2000;       // Representa 20.00
const INITIAL_LIFE_VALUE = 2000; // Representa 20.00 (Vida completa)
const KEY_PREFIX = 'studentTraits_';

// Constantes de manejo de decimales
const CHANGE_VALUE = 25;    // Representa el incremento/decremento de 0.25
const DECIMAL_DIVISOR = 100; // Para convertir de interno a visible

let currentStudentName = null;

// Estructura de datos por defecto para un estudiante
function getDefaultTraitData() {
    return {
        life: INITIAL_LIFE_VALUE, // 2000 (Inicia full vida)
        maxAccumulated: 0         // 0 (Puntos extra)
    };
}

// ----------------------------------------------------
// MANEJO DE DATOS (LOAD, SAVE, CONVERSIÓN)
// ----------------------------------------------------

/**
 * Convierte un valor interno (entero, x100) a un valor decimal visible.
 * Muestra "20" si está lleno, y decimales si son necesarios (ej: "19.75").
 * * @param {number} value - Valor interno entero.
 * @returns {string} - Valor visible (ej: "20", "19.75", "0.50").
 */
function formatValue(value) {
    // Aseguramos que el valor es un número y lo dividimos por 100
    const decimalValue = (parseInt(value) || 0) / DECIMAL_DIVISOR;
    
    // Si el valor es un número entero (ej: 20.00, 19.00), lo devuelve sin decimales (ej: "20")
    if (decimalValue % 1 === 0) {
        return decimalValue.toString();
    }
    
    // Si tiene decimales (ej: 19.75), lo devuelve con dos decimales (ej: "19.75")
    return decimalValue.toFixed(2);
}

/**
 * Carga los datos de rasgos de un estudiante desde localStorage.
 */
function loadStudentData(name) {
    const key = KEY_PREFIX + name;
    const storedData = localStorage.getItem(key);
    
    if (storedData) {
        const data = JSON.parse(storedData);
        // Aseguramos que los valores cargados sean enteros.
        data.life = parseInt(data.life) || INITIAL_LIFE_VALUE;
        data.maxAccumulated = parseInt(data.maxAccumulated) || 0;
        return data;
    } else {
        const data = getDefaultTraitData();
        saveStudentData(name, data);
        return data;
    }
}

/**
 * Guarda los datos de rasgos de un estudiante en localStorage.
 */
function saveStudentData(name, data) {
    const key = KEY_PREFIX + name;
    localStorage.setItem(key, JSON.stringify(data));
    updateStudentCardLife(name, data.life, data.maxAccumulated);
}

// ----------------------------------------------------
// NAVEGACIÓN Y RENDERIZACIÓN DE PANTALLAS
// ----------------------------------------------------

/**
 * Muestra u oculta pantallas.
 */
function switchScreen(showId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(showId).classList.add('active');
}

/**
 * Renderiza la lista de estudiantes en la pantalla de inicio.
 */
function renderStudentList() {
    const listContainer = document.getElementById('student-list');
    listContainer.innerHTML = '';

    STUDENTS_DATA.forEach(name => {
        const data = loadStudentData(name);
        
        const card = document.createElement('div');
        card.className = 'student-card';
        card.dataset.name = name;
        
        const lifeDisplay = formatValue(data.life);
        const maxAccumulatedDisplay = formatValue(data.maxAccumulated);

        card.innerHTML = `
            <span class="student-name">${name}</span>
            <span class="student-trait" data-life="${data.life}">
                ${lifeDisplay}/${formatValue(MAX_LIFE)} (${maxAccumulatedDisplay} extra)
            </span>
        `;
        
        card.addEventListener('click', () => openStudentProfile(name));
        listContainer.appendChild(card);
    });
}

/**
 * Actualiza el valor de vida en la tarjeta de la lista.
 */
function updateStudentCardLife(name, life, maxAccumulated) {
    const cardSpan = document.querySelector(`.student-card[data-name="${name}"] .student-trait`);
    if (cardSpan) {
        const lifeDisplay = formatValue(life);
        const maxAccumulatedDisplay = formatValue(maxAccumulated);
        cardSpan.textContent = `${lifeDisplay}/${formatValue(MAX_LIFE)} (${maxAccumulatedDisplay} extra)`;
    }
}

/**
 * Actualiza la barra de vida y los valores numéricos en el perfil.
 */
function updateProfileView(life, maxAccumulated) {
    const bar = document.getElementById('trait-bar');
    const valueSpan = document.getElementById('trait-value');
    const maxSpan = document.getElementById('max-trait-value');

    // Usamos los valores internos (enteros) para el porcentaje
    let percent = (life / MAX_LIFE) * 100;
    percent = Math.max(0, Math.min(100, percent));

    bar.style.width = `${percent}%`;
    // Usamos formatValue para asegurar que 2000 se muestre como 20
    valueSpan.textContent = `${formatValue(life)}/${formatValue(MAX_LIFE)}`; 
    maxSpan.textContent = formatValue(maxAccumulated);
}


function openStudentProfile(name) {
    currentStudentName = name;
    const data = loadStudentData(name);

    document.getElementById('profile-title').textContent = `Perfil de ${name}`;
    document.getElementById('profile-name').textContent = name;
    
    updateProfileView(data.life, data.maxAccumulated);
    switchScreen('profile-screen');
}

// ----------------------------------------------------
// LÓGICA DE ACCIÓN (+ / -)
// ----------------------------------------------------

/**
 * Maneja las acciones de aumentar o disminuir la barra de vida (en 0.25).
 */
function handleTraitAction(actionType) {
    if (!currentStudentName) return;

    const studentData = loadStudentData(currentStudentName);
    let newLife = studentData.life;
    let newMax = studentData.maxAccumulated;
    
    const VALUE_CHANGE = CHANGE_VALUE; // 25 (representa 0.25)

    if (actionType === 'positive') {
        newLife += VALUE_CHANGE;
        if (newLife > MAX_LIFE) {
            newMax += (newLife - MAX_LIFE); 
            newLife = MAX_LIFE; 
        }
    } else if (actionType === 'negative') {
        if (newLife > 0) {
            newLife -= VALUE_CHANGE; // Disminuye 0.25 de la vida visible
            
            if (newLife < 0) {
                // Si la vida baja de 0, el exceso se resta de los puntos extra
                let excess = Math.abs(newLife);
                newLife = 0;
                newMax -= excess;
                
                if (newMax < 0) {
                    newMax = 0;
                }
            }
        } else if (newMax > 0) {
            // Si la vida es 0, los puntos extra bajan en 0.25
            newMax -= VALUE_CHANGE;
            if (newMax < 0) {
                newMax = 0;
            }
        }
    }

    studentData.life = newLife;
    studentData.maxAccumulated = newMax;
    
    saveStudentData(currentStudentName, studentData);
    updateProfileView(studentData.life, studentData.maxAccumulated);
}

// ----------------------------------------------------
// Inicialización y Event Listeners
// ----------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    renderStudentList();

    // 1. Configurar el botón de volver (perfil -> lista)
    document.getElementById('back-button').addEventListener('click', () => {
        currentStudentName = null;
        switchScreen('home-screen');
        renderStudentList(); 
    });

    // 2. Configurar los botones de acción (+ / -)
    document.querySelectorAll('.action-btn[data-action]').forEach(button => {
        button.addEventListener('click', (e) => {
            const action = e.currentTarget.dataset.action;
            handleTraitAction(action);
        });
    });
});
