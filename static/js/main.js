document.addEventListener('DOMContentLoaded', function() {
    const testSteps = [];
    
    // Button handlers
    document.getElementById('newTest').addEventListener('click', createNewTest);
    document.getElementById('runTest').addEventListener('click', runTest);
    document.getElementById('saveTest').addEventListener('click', saveTest);

    function createNewTest() {
        const step = {
            action: 'Click',
            target: '',
            value: ''
        };
        addStepToTable(step);
    }

    function addStepToTable(step) {
        const tbody = document.getElementById('stepTableBody');
        const row = document.createElement('tr');
        
        // Action cell with dropdown
        const actionCell = document.createElement('td');
        const actionSelect = document.createElement('select');
        ['Click', 'Type', 'Select', 'Wait', 'Verify'].forEach(action => {
            const option = document.createElement('option');
            option.value = action;
            option.textContent = action;
            if (action === step.action) option.selected = true;
            actionSelect.appendChild(option);
        });
        actionCell.appendChild(actionSelect);

        // Target cell
        const targetCell = document.createElement('td');
        const targetInput = document.createElement('input');
        targetInput.type = 'text';
        targetInput.value = step.target;
        targetInput.placeholder = 'Enter selector';
        targetCell.appendChild(targetInput);

        // Value cell
        const valueCell = document.createElement('td');
        const valueInput = document.createElement('input');
        valueInput.type = 'text';
        valueInput.value = step.value;
        valueInput.placeholder = 'Enter value';
        valueCell.appendChild(valueInput);

        // Actions cell
        const actionsCell = document.createElement('td');
        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        deleteBtn.onclick = () => row.remove();
        actionsCell.appendChild(deleteBtn);

        // Add all cells to row
        row.appendChild(actionCell);
        row.appendChild(targetCell);
        row.appendChild(valueCell);
        row.appendChild(actionsCell);

        tbody.appendChild(row);
    }

    function saveTest() {
        const steps = [];
        const rows = document.getElementById('stepTableBody').getElementsByTagName('tr');
        
        for (let row of rows) {
            const cells = row.getElementsByTagName('td');
            steps.push({
                action: cells[0].querySelector('select').value,
                target: cells[1].querySelector('input').value,
                value: cells[2].querySelector('input').value
            });
        }

        fetch('/create_test', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ steps: steps })
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                alert('Test case saved successfully!');
            }
        })
        .catch(error => console.error('Error:', error));
    }

    function runTest() {
        const steps = [];
        const rows = document.getElementById('stepTableBody').getElementsByTagName('tr');
        
        for (let row of rows) {
            const cells = row.getElementsByTagName('td');
            steps.push({
                action: cells[0].querySelector('select').value,
                target: cells[1].querySelector('input').value,
                value: cells[2].querySelector('input').value
            });
        }

        fetch('/run_test', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ steps: steps })
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                alert('Test executed successfully!');
            }
        })
        .catch(error => console.error('Error:', error));
    }

    // Add sample test case
    addStepToTable({
        action: 'Click',
        target: '#login-button',
        value: ''
    });
     // Redimensionnement de la sidebar
    const resizer = document.querySelector(".resizer");
    const sidebar = document.querySelector(".sidebar");
    const sidebarTitle = document.querySelector(".sidebar-title");

    sidebarTitle.addEventListener("click", function() {
        sidebar.classList.toggle("collapsed");
    });
    let isResizing = false;

    resizer.addEventListener("mousedown", function(e) {
        isResizing = true;
        document.addEventListener("mousemove", resize);
        document.addEventListener("mouseup", stopResize);
    });

    function resize(e) {
        if (isResizing) {
            let newWidth = e.clientX;
            if (newWidth < 150) newWidth = 150; // Largeur minimale
            if (newWidth > 500) newWidth = 500; // Largeur maximale
            sidebar.style.width = newWidth + "px";
        }
    }

    function stopResize() {
        isResizing = false;
        document.removeEventListener("mousemove", resize);
        document.removeEventListener("mouseup", stopResize);
    }
});
