document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.querySelector('#workOrderTable tbody');
    const paginationControls = document.querySelector('#paginationControls');
    const rowsPerPage = 5; // Number of rows per page
    let currentPage = 1;

    if (!tableBody) {
        console.error('Table body not found.');
        return;
    }

    // Function to fetch and display data in the table
    async function updateTable(page = 1) {
        try {
            // Fetch data from the server
            const response = await fetch('/api/jit/all');

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Fetched data:', data);

            tableBody.innerHTML = ''; // Clear existing rows

            // Calculate the start and end index for the current page
            const startIndex = (page - 1) * rowsPerPage;
            const endIndex = Math.min(startIndex + rowsPerPage, data.length);

            for (let i = startIndex; i < endIndex; i++) {
                const order = data[i];
                const row = `<tr>
                    <td>${order.line || 'N/A'}</td>
                    <td>${order.workOrder || 'N/A'}</td>
                    <td>${new Date(order.time).toLocaleString()}</td>
                    <td>${order.hiMaterial || 'N/A'}</td>
                    <td>${order.assemblyMaterial || 'N/A'}</td>
                    <td>${order.packingMaterial || 'N/A'}</td>
                    <td><button class="delete-btn" data-id="${order._id}">Delete</button></td>
                </tr>`;
                tableBody.innerHTML += row;
            }

            // Update pagination controls
            updatePaginationControls(data.length, page);

            // Add event listeners for delete buttons
            addDeleteButtonListeners();

        } catch (error) {
            console.error('Error fetching data:', error);
            alert('Error: Unable to fetch work orders.');
        }
    }

    // Create pagination buttons and page indicators
    function updatePaginationControls(totalItems, page) {
        const totalPages = Math.ceil(totalItems / rowsPerPage);
        paginationControls.innerHTML = '';

        // Previous button
        if (page > 1) {
            const prevButton = document.createElement('button');
            prevButton.textContent = 'Previous';
            prevButton.addEventListener('click', () => updateTable(page - 1));
            paginationControls.appendChild(prevButton);
        }

        // Page numbers
        const pageIndicator = document.createElement('span');
        pageIndicator.textContent = ` Page ${page} of ${totalPages} `;
        paginationControls.appendChild(pageIndicator);

        // Next button
        if (page < totalPages) {
            const nextButton = document.createElement('button');
            nextButton.textContent = 'Next';
            nextButton.addEventListener('click', () => updateTable(page + 1));
            paginationControls.appendChild(nextButton);
        }
    }

    // Handle form submission
    document.getElementById('jitForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const workOrder = document.getElementById('workOrder').value;
        const line = document.getElementById('line').value;
        const time = document.getElementById('time').value;
        const hiMaterial = document.getElementById('hiMaterial').value;
        const assemblyMaterial = document.getElementById('assemblyMaterial').value;
        const packingMaterial = document.getElementById('packingMaterial').value;

        try {
            const response = await fetch('/api/jit/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ workOrder, line, time, hiMaterial, assemblyMaterial, packingMaterial })
            });
            const result = await response.json();
            alert(result.message || 'Success');
            updateTable(currentPage); // Refresh table after form submission
        } catch (error) {
            console.error('Error:', error);
        }
    });

    // Delete record function
    async function deleteRecord(id) {
        try {
            await fetch(`/api/jit/delete/${id}`, {
                method: 'DELETE'
            });
            alert('Record deleted successfully');
            updateTable(currentPage); // Refresh the table after deletion
        } catch (error) {
            console.error('Error deleting record:', error);
        }
    }

    // Add event listeners to delete buttons
    function addDeleteButtonListeners() {
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', async () => {
                const id = button.getAttribute('data-id');
                await deleteRecord(id);
            });
        });
    }

    // Function to fetch and populate tables by line
    async function populateTables() {
        const container = document.querySelector('#tablesContainer');
        
        if (container) {
            try {
                const response = await fetch('/api/jit/all');
                const data = await response.json();

                container.innerHTML = ''; // Clear container

                const lines = [...new Set(data.map(order => order.line))]; // Extract unique lines

                lines.forEach((line) => {
                    const table = document.createElement('table');
                    table.setAttribute('id', `table-${line}`);
                    table.innerHTML = `
                        <thead>
                            <tr>
                                <th colspan="6">${line}</th>
                            </tr>
                            <tr>
                                <th>Line</th>
                                <th>Work Order</th>
                                <th>Time</th>
                                <th>HI Material</th>
                                <th>Assembly Material</th>
                                <th>Packing Material</th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    `;

                    const tableBody = table.querySelector('tbody');
                    const filteredData = data.filter(order => order.line === line);

                    if (filteredData.length > 0) {
                        filteredData.forEach((order) => {
                            const row = `
                                <tr>
                                    <td>${order.line}</td>
                                    <td>${order.workOrder}</td>
                                    <td>${new Date(order.time).toLocaleString()}</td>
                                    <td>${order.hiMaterial}</td>
                                    <td>${order.assemblyMaterial}</td>
                                    <td>${order.packingMaterial}</td>
                                </tr>
                            `;
                            tableBody.innerHTML += row;
                        });
                    } else {
                        tableBody.innerHTML = `<tr><td colspan="6">No data available for this line</td></tr>`;
                    }

                    container.appendChild(table);
                });

            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }
    }

    window.addEventListener('load', () => {
        populateTables();
        updateTable(currentPage); // Load the first page of the main table
    });

    setInterval(populateTables, 5000); // Auto-refresh every 5 seconds
});
