document.addEventListener('DOMContentLoaded', () => {
    console.log("admin.js loaded and running!");

    // Get Firebase services (assuming Firebase is already initialized by auth.js)
    const app = firebase.app();
    const db = app.firestore();
    const auth = app.auth();
    const storage = app.storage();

    // ✅ Auth Check
    auth.onAuthStateChanged(user => {
        if (!user) {
            window.location.href = 'login.html';
        }
    });

    // ✅ Logout Button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            auth.signOut().then(() => {
                window.location.href = 'index.html';
            });
        });
    }

    // ✅ Sidebar Navigation
    const sidebarLinks = document.querySelectorAll('.sidebar-nav a');

    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const parentLi = link.parentElement;
            const isSubmenuParent = parentLi.classList.contains('has-submenu');
            const targetId = link.dataset.target;

            if (isSubmenuParent) {
                // If it's a main menu item with submenu, toggle its active state
                if (link.parentElement.parentElement.classList.contains('sidebar-nav')) {
                    // Close other open submenus
                    document.querySelectorAll('.sidebar-nav .has-submenu').forEach(item => {
                        if (item !== parentLi) {
                            item.classList.remove('active');
                        }
                    });
                    // Toggle current submenu
                    parentLi.classList.toggle('active');
                    
                    // If we're opening a submenu, show its default content
                    if (parentLi.classList.contains('active') && targetId) {
                        handleContentNavigation(targetId);
                    }
                }
            } else {
                // Handle content visibility for submenu items and regular links
                if (targetId) {
                    handleContentNavigation(targetId);
                }
            }
        });
    });

    function handleContentNavigation(targetId) {
        // Hide all sections
        document.querySelectorAll('.admin-section, .admin-section-container').forEach(section => {
            section.classList.add('hidden');
        });

        // Show target section/container
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            targetElement.classList.remove('hidden');
            // If it's a sub-section, also show its parent container
            if (targetElement.closest('.admin-section-container')) {
                targetElement.closest('.admin-section-container').classList.remove('hidden');
            }
        }
        
        // Handle active states for sidebar links
        sidebarLinks.forEach(link => link.classList.remove('active-link')); // Remove from all links
        const activeLink = document.querySelector(`.sidebar-nav a[data-target="${targetId}"]`);
        if (activeLink) {
            activeLink.classList.add('active-link'); // Add to the clicked link
            // Also activate parent if it's a submenu item
            const parentSubmenu = activeLink.closest('.has-submenu');
            if (parentSubmenu) {
                parentSubmenu.classList.add('active');
            }
        }

        // Fetch data if switching to a view section
        if (targetId === 'view-events') fetchAndDisplayEvents();
        if (targetId === 'view-finance') fetchAndDisplayFinance();
    }

    // Set default view and activate its link
    handleContentNavigation('dashboard');
    document.querySelector('.sidebar-nav a[data-target="dashboard"]').classList.add('active-link');


    // ✅ Fetch and Display Events - Updated to match your HTML structure
    async function fetchAndDisplayEvents() {
        const upcomingEventsList = document.getElementById('upcoming-events-list');
        const pastEventsList = document.getElementById('past-events-list');

        if (!upcomingEventsList || !pastEventsList) return;

        upcomingEventsList.innerHTML = '<p>Loading events...</p>';
        pastEventsList.innerHTML = '<p>Loading events...</p>';

        try {
            const snapshot = await db.collection('events').orderBy('date', 'desc').get();

            if (snapshot.empty) {
                upcomingEventsList.innerHTML = '<p>No upcoming events found.</p>';
                pastEventsList.innerHTML = '<p>No past events found.</p>';
                return;
            }

            upcomingEventsList.innerHTML = '';
            pastEventsList.innerHTML = '';

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            let upcomingCount = 0;
            let pastCount = 0;

            snapshot.forEach(doc => {
                const event = doc.data();
                if (!event.date) return;

                const eventDate = new Date(event.date);
                const isUpcoming = eventDate >= today;

                const eventItem = document.createElement('div');
                eventItem.className = 'event-item'; // Use a more generic class
                eventItem.innerHTML = `
                    <div class="event-card">
                        ${event.imageUrl ? 
                            `<img src="${event.imageUrl}" alt="${event.title}" class="event-image">` : 
                            '<div class="event-no-image">No Image</div>'}
                        <div class="event-details">
                            <h5>${event.title || 'Untitled Event'}</h5>
                            <p>
                                <strong>Date:</strong> ${event.date} ${event.time || ''}<br>
                                ${event.description || 'No description'}
                            </p>
                        </div>
                        <div class="event-actions">
                            <button class="delete-event-btn" data-id="${doc.id}">Delete</button>
                        </div>
                    </div>
                `;

                if (isUpcoming) {
                    upcomingEventsList.appendChild(eventItem);
                    upcomingCount++;
                } else {
                    pastEventsList.appendChild(eventItem);
                    pastCount++;
                }
            });

            if (upcomingCount === 0) {
                upcomingEventsList.innerHTML = '<p>No upcoming events found.</p>';
            }
            if (pastCount === 0) {
                pastEventsList.innerHTML = '<p>No past events found.</p>';
            }

            // Add delete event handlers
            document.querySelectorAll('.delete-event-btn').forEach(button => {
                button.addEventListener('click', async (e) => {
                    if (confirm('Are you sure you want to delete this event?')) {
                        try {
                            await db.collection('events').doc(e.target.dataset.id).delete();
                            fetchAndDisplayEvents(); // Refresh the list
                        } catch (error) {
                            console.error("Error deleting event:", error);
                            alert('Failed to delete event');
                        }
                    }
                });
            });

        } catch (error) {
            console.error("Error fetching events:", error);
            upcomingEventsList.innerHTML = '<p class="text-danger">Error loading events.</p>';
            pastEventsList.innerHTML = '<p class="text-danger">Error loading events.</p>';
        }
    }


    // ✅ Event Form Submission
    const eventForm = document.getElementById("event-form");
    const msg = document.getElementById("msg");

    if (eventForm) {
      eventForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        // ... (rest of the form submission logic is the same)
        const title = document.getElementById("title").value.trim();
        const description = document.getElementById("description").value.trim();
        const date = document.getElementById("date").value;
        const time = document.getElementById("time").value;
        const image = document.getElementById("image").files[0];

        if (!image) {
          alert("Please select an image.");
          return;
        }

        try {
          msg.textContent = "Uploading image...";
          const imageUrl = await uploadToImgBB(image);

          await db.collection("events").add({
            title,
            description,
            date,
            time,
            imageUrl,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
          });

          msg.textContent = "✅ Event added successfully!";
          alert("✅ Event added successfully!");
          eventForm.reset();

        } catch (err) {
          alert(`❌ Failed to add event. Reason: ${err.message}`);
        }
      });
    }

    // ✅ Finance Form Submission
    const financeForm = document.getElementById("financeForm");
    const financeMessage = document.getElementById("financeMessage");

    if (financeForm) {
      financeForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        // ... (rest of the form submission logic is the same)
        const financeDate = document.getElementById("financeDate").value;
        const financeDescription = document.getElementById("financeDescription").value.trim();
        const amount = parseFloat(document.getElementById("amount").value);
        const entryType = document.getElementById("entryType").value;

        try {
          await db.collection("finances").add({
            date: financeDate,
            description: financeDescription,
            amount,
            type: entryType,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
          });

          financeMessage.textContent = "✅ Finance entry added successfully!";
          alert("✅ Finance entry added successfully!");
          financeForm.reset();
        } catch (err) {
          alert(`❌ Failed to add finance entry. Reason: ${err.message}`);
        }
      });
    }

    // ✅ Fetch and Display Finance Data
    async function fetchAndDisplayFinance() {
        const tableBody = document.getElementById('financeTableBody');
        const totalBalanceEl = document.getElementById('totalBalance');
        if (!tableBody) return;
        tableBody.innerHTML = '<tr><td colspan="5">Loading data...</td></tr>';

        try {
            const snapshot = await db.collection('finances').orderBy('date', 'desc').get();
            if (snapshot.empty) {
                tableBody.innerHTML = '<tr><td colspan="5">No finance data found.</td></tr>';
                return;
            }
            tableBody.innerHTML = '';
            let totalBalance = 0;
            snapshot.forEach(doc => {
                const entry = doc.data();
                const amount = entry.type === 'income' ? entry.amount : -entry.amount;
                totalBalance += amount;

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${entry.date}</td>
                    <td>${entry.description}</td>
                    <td class="${entry.type}">${entry.amount.toFixed(2)}</td>
                    <td class="${entry.type}">${entry.type}</td>
                    <td><button class="delete-finance-btn" data-id="${doc.id}">Delete</button></td>
                `;
                tableBody.appendChild(row);
            });
            totalBalanceEl.textContent = `₹ ${totalBalance.toFixed(2)}`;
        } catch (error) {
            tableBody.innerHTML = '<tr><td colspan="5">Error loading data.</td></tr>';
        }
    }
    
    // ✅ ImgBB Upload Function (re-usable)
    async function uploadToImgBB(file) {
      const imgbbApiKey = "f64ba9f90a188d6c12b1278a01d9609a";
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbApiKey}`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("ImgBB upload failed");
      const data = await res.json();
      return data.data.url;
    }
});
