const apiUrl = "http://localhost:8080/api/employees";

function loadEmployees() {
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById("employeeTableBody");
            tableBody.innerHTML = "";

            data.forEach(employee => {
                const row = `
                    <tr>
                        <td>${employee.id}</td>
                        <td>${employee.firstName}</td>
                        <td>${employee.lastName}</td>
                        <td>${employee.email}</td>
                        <td>${employee.department}</td>
                        <td>
                            <button onclick="editEmployee(${employee.id})">Edit</button>
                            <button onclick="deleteEmployee(${employee.id})">Delete</button>
                        </td>
                    </tr>
                `;
                tableBody.innerHTML += row;
            });
        })
        .catch(error => console.log(error));
}

document.getElementById("employeeForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const id = document.getElementById("empId").value;

    const employee = {
        firstName: document.getElementById("firstName").value,
        lastName: document.getElementById("lastName").value,
        email: document.getElementById("email").value,
        department: document.getElementById("department").value
    };

    if (id === "") {
        fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(employee)
        })
            .then(() => {
                document.getElementById("employeeForm").reset();
                loadEmployees();
            });
    } else {
        fetch(apiUrl + "/" + id, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(employee)
        })
            .then(() => {
                document.getElementById("employeeForm").reset();
                document.getElementById("empId").value = "";
                loadEmployees();
            });
    }
});

function editEmployee(id) {
    fetch(apiUrl + "/" + id)
        .then(response => response.json())
        .then(employee => {
            document.getElementById("empId").value = employee.id;
            document.getElementById("firstName").value = employee.firstName;
            document.getElementById("lastName").value = employee.lastName;
            document.getElementById("email").value = employee.email;
            document.getElementById("department").value = employee.department;
        });
}

function deleteEmployee(id) {
    if (confirm("Are you sure you want to delete this employee?")) {
        fetch(apiUrl + "/" + id, {
            method: "DELETE"
        })
            .then(() => loadEmployees());
    }
}

loadEmployees();