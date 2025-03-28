document.addEventListener("DOMContentLoaded", () => {
    fetchVehicles();
    fetchReservations();
    fetchReviews();
    loadAvailableVehicles();
});

// Fetch Vehicles and Display in Admin Panel
async function fetchVehicles() {
    let response = await fetch('http://localhost:5000/vehicles');
    let vehicles = await response.json();
    let table = document.getElementById("vehiclesTable");

    vehicles.forEach((vehicle) => {
        let row = table.insertRow();
        row.innerHTML = `
            <td>${vehicle.name}</td>
            <td>₱${vehicle.pricePerHour}/hour</td>
            <td class="${vehicle.availability ? '' : 'unavailable'}">
                ${vehicle.availability ? 'Available' : 'Not Available'}
            </td>
            <td>
                <button class='btn' onclick='toggleAvailability("${vehicle._id}", ${vehicle.availability})'>
                    ${vehicle.availability ? 'Mark Unavailable' : 'Mark Available'}
                </button>
            </td>
        `;
    });
}

// Toggle Vehicle Availability
async function toggleAvailability(vehicleId, currentStatus) {
    let newStatus = !currentStatus;
    await fetch(`http://localhost:5000/admin/update-availability/${vehicleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ availability: newStatus })
    });
    location.reload();
}

// Fetch Reservations
async function fetchReservations() {
    let response = await fetch('http://localhost:5000/reservations');
    let reservations = await response.json();
    let table = document.getElementById("reservationsTable");

    reservations.forEach((res) => {
        let row = table.insertRow();
        row.innerHTML = `
            <td>${res.name}</td>
            <td>${res.phone}</td>
            <td>${res.vehicle.name}</td>
            <td>${new Date(res.pickupDate).toLocaleString()}</td>
            <td>${new Date(res.returnDate).toLocaleString()}</td>
            <td><button class='btn' onclick='deleteReservation("${res._id}")'>Delete</button></td>
        `;
    });
}

// Fetch Reviews
async function fetchReviews() {
    let response = await fetch('http://localhost:5000/reviews');
    let reviews = await response.json();
    let table = document.getElementById("reviewsTable");

    reviews.forEach((rev) => {
        let row = table.insertRow();
        row.innerHTML = `
            <td>${rev.name}</td>
            <td>${rev.rating}</td>
            <td>${rev.review}</td>
            <td><button class='btn' onclick='deleteReview("${rev._id}")'>Delete</button></td>
        `;
    });
}

// Delete Reservation
async function deleteReservation(reservationId) {
    await fetch(`http://localhost:5000/admin/delete-reservation/${reservationId}`, {
        method: 'DELETE'
    });
    location.reload();
}

// Delete Review
async function deleteReview(reviewId) {
    await fetch(`http://localhost:5000/admin/delete-review/${reviewId}`, {
        method: 'DELETE'
    });
    location.reload();
}

// Load Available Vehicles for Reservation Form
async function loadAvailableVehicles() {
    let response = await fetch('http://localhost:5000/vehicles');
    let vehicles = await response.json();
    let vehicleDropdown = document.getElementById("vehicle");

    vehicles.forEach(vehicle => {
        let option = document.createElement("option");
        option.value = vehicle._id;
        option.text = `${vehicle.name} (₱${vehicle.pricePerHour}/hour)`;
        if (!vehicle.availability) {
            option.disabled = true;
        }
        vehicleDropdown.appendChild(option);
    });
}
