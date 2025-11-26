/**
 * ARCHIVO: script.js
 * FUNCIÓN: Contiene la lógica para calcular el promedio de las 10 materias
 * y mostrar el resultado en el HTML.
 */

function calculateAverage() {
    // 1. Selecciona todos los campos de nota dentro del formulario
    const gradeInputs = document.querySelectorAll('#average-form input[type="number"]');
    let totalSum = 0;
    const numberOfSubjects = gradeInputs.length; // En este caso, es 10.

    // 2. Itera sobre los campos, suma los valores y valida que no excedan 20
    gradeInputs.forEach(input => {
        // Obtiene el valor, lo convierte a número flotante. Si no es un número válido (NaN o vacío), usa 0.
        let grade = parseFloat(input.value) || 0; 
        
        // Aplica la restricción de nota máxima de 20 (aunque el HTML ya lo restringe, esto asegura la lógica)
        if (grade > 20) {
            grade = 20;
            input.value = 20; // Opcional: corrige el valor en el campo visualmente
        } else if (grade < 0) {
             grade = 0;
            input.value = 0;
        }

        totalSum += grade;
    });

    // 3. Calcula el promedio
    let average = 0;
    if (numberOfSubjects > 0) {
        average = totalSum / numberOfSubjects;
    }

    // 4. Muestra el resultado en el elemento con id="final-average"
    const resultElement = document.getElementById('final-average');
    // Muestra el promedio redondeado a dos decimales
    resultElement.textContent = average.toFixed(2) + ' / 20';
}

// 5. Se asegura de que el DOM esté completamente cargado antes de añadir los escuchadores de eventos
document.addEventListener('DOMContentLoaded', () => {
    // Llama a la función al inicio para mostrar "0.00 / 20"
    calculateAverage();

    // Selecciona todos los campos de nota
    const gradeInputs = document.querySelectorAll('#average-form input[type="number"]');
    
    // Asigna la función 'calculateAverage' al evento 'input' de cada campo.
    // El evento 'input' se dispara inmediatamente cuando el usuario escribe o cambia el valor.
    gradeInputs.forEach(input => {
        input.addEventListener('input', calculateAverage);
    });

    // Opcional: Añadir un evento para recalcular después de que el formulario se limpia
    const form = document.getElementById('average-form');
    form.addEventListener('reset', () => {
        // Usa setTimeout para que el cálculo se ejecute después de que los campos se hayan limpiado
        setTimeout(calculateAverage, 10); 
    });
});
