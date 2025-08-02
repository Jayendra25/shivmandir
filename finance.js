document.addEventListener('DOMContentLoaded', () => {
  // Assumes firebase-app-compat, auth-compat, and firestore-compat are loaded.
  // Assumes auth.js is loaded.

  const db = firebase.firestore();
  const auth = firebase.auth();

  const financeTableBody = document.getElementById('finance-table-body');
  const financeCardsContainer = document.getElementById('finance-cards-container');

  auth.onAuthStateChanged(user => {
    if (user) {
      // User is logged in, fetch and display data.
      fetchFinanceData();
    } else {
      // User is not logged in, clear the table and show a message.
      if (financeTableBody) financeTableBody.innerHTML = '';
      if (financeCardsContainer) financeCardsContainer.innerHTML = '<p>Please log in to view finance details.</p>';
      // Optional: redirect to login page
      // window.location.href = 'login.html';
    }
  });

  async function fetchFinanceData() {
    try {
      const snapshot = await db.collection("finances").orderBy("date", "desc").get();
      
      if (financeTableBody) financeTableBody.innerHTML = '';
      if (financeCardsContainer) financeCardsContainer.innerHTML = '';

      if (snapshot.empty) {
        const message = '<li>No finance data found.</li>';
        if (financeTableBody) financeTableBody.innerHTML = `<tr><td colspan="5">${message}</td></tr>`;
        if (financeCardsContainer) financeCardsContainer.innerHTML = `<p>No finance data found.</p>`;
        return;
      }

      snapshot.forEach(doc => {
        const entry = doc.data();
        
        // Render table row
        if (financeTableBody) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td data-label="Date">${entry.date}</td>
                <td data-label="Description">${entry.description}</td>
                <td data-label="Category">${entry.category || 'N/A'}</td>
                <td data-label="Amount (INR)">${entry.amount.toFixed(2)}</td>
                <td data-label="Type" class="${entry.type}">${entry.type}</td>
            `;
            financeTableBody.appendChild(row);
        }

        // Render card
        if (financeCardsContainer) {
            const card = document.createElement('div');
            card.className = `finance-card ${entry.type}`;
            card.innerHTML = `
                <div class="card-header">
                    <span class="card-date">${entry.date}</span>
                    <span class="card-type">${entry.type}</span>
                </div>
                <div class="card-body">
                    <p class="card-description">${entry.description}</p>
                    <p class="card-amount">₹ ${entry.amount.toFixed(2)}</p>
                </div>
                <div class="card-footer">
                    <span>Category: ${entry.category || 'N/A'}</span>
                </div>
            `;
            financeCardsContainer.appendChild(card);
        }
      });

    } catch (error) {
      console.error("Error fetching finance data:", error);
      if (financeCardsContainer) financeCardsContainer.innerHTML = '<p>Error loading data. Please try again later.</p>';
    }
  }
});
