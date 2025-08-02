document.addEventListener('DOMContentLoaded', async () => {
    // Firebase SDKs
    const firebaseConfig = {
        apiKey: "AIzaSyBHyFRMnx2rLrVIfUW5hsFz1mdbXgQsI5E",
        authDomain: "templecommittee-2de4f.firebaseapp.com",
        projectId: "templecommittee-2de4f",
        storageBucket: "templecommittee-2de4f.appspot.com",
        messagingSenderId: "739412456793",
        appId: "1:739412456793:web:de0f3399644623722d8848"
    };

    // Initialize Firebase
    if (!window.firebase) {
        alert("Firebase SDK not loaded. Check your internet connection.");
        return;
    }
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    const db = firebase.firestore();

    // Fetch events from Firestore
    async function fetchEvents() {
        const snapshot = await db.collection("events").orderBy("date", "desc").get();
        const upcoming = [];
        const past = [];
        const todayStr = new Date().toISOString().slice(0, 10);

        snapshot.forEach(doc => {
            const event = doc.data();
            if (!event.date || typeof event.date !== "string" || event.date.length < 10) {
                return; // Skip invalid events
            }

            let eventDateStr = event.date;
            try {
                if (eventDateStr.length !== 10) {
                    eventDateStr = new Date(event.date).toISOString().slice(0, 10);
                }
            } catch (e) {
                return; // Skip invalid dates
            }

            if (eventDateStr >= todayStr) {
                upcoming.push(event);
            } else {
                past.push(event);
            }
        });

        renderEvents(upcoming, 'upcoming-events-grid', 'Upcoming');
        renderEvents(past, 'past-events-grid', 'Past');
    }

    function renderEvents(events, containerId, statusText) {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = "";

        if (events.length === 0) {
            container.innerHTML = `<p>No ${statusText.toLowerCase()} events found.</p>`;
            return;
        }

        events.forEach(event => {
            const statusClass = statusText.toLowerCase();
            const eventCard = document.createElement("div");
            eventCard.className = `event-card ${statusClass}`;
            eventCard.innerHTML = `
                <div class="event-card-image">
                    <img src="${event.imageUrl || 'https://via.placeholder.com/400x200'}" alt="${event.title}">
                    <span class="event-status">${statusText}</span>
                </div>
                <div class="event-card-content">
                    <h3 class="event-title">${event.title}</h3>
                    <p class="event-date"><strong>Date:</strong> ${event.date} ${event.time ? `| <strong>Time:</strong> ${event.time}` : ''}</p>
                    <p class="event-description">${event.description}</p>
                </div>
            `;
            container.appendChild(eventCard);
        });
    }

    await fetchEvents();

    const burger = document.querySelector('.burger');
    const navLinks = document.querySelector('.nav-links');
    const navLinksLi = document.querySelectorAll('.nav-links li');
    const navbar = document.querySelector('.navbar');

    // Sticky Navbar with Fade on Scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Toggle Nav (Hamburger Menu)
    burger.addEventListener('click', () => {
        navLinks.classList.toggle('nav-active');

        // Animate Links
        navLinksLi.forEach((link, index) => {
            if (link.style.animation) {
                link.style.animation = '';
            } else {
                link.style.animation = `navLinkFade 0.5s ease forwards ${index / 7 + 0.3}s`;
            }
        });

        // Burger Animation
        burger.classList.toggle('toggle');
    });

    // Close nav when a link is clicked (for mobile)
    navLinksLi.forEach(link => {
        link.addEventListener('click', () => {
            if (navLinks.classList.contains('nav-active')) {
                navLinks.classList.remove('nav-active');
                burger.classList.remove('toggle');
                navLinksLi.forEach(item => {
                    item.style.animation = ''; // Reset animation
                });
            }
        });
    });

    // Active Nav Link Highlighting
    const highlightActiveLink = () => {
        const currentPath = window.location.pathname.split('/').pop();
        const sections = document.querySelectorAll('section[id]');
        let activeSectionId = '';

        // Determine which section is currently in view
        sections.forEach(section => {
            const sectionTop = section.offsetTop - navbar.offsetHeight - 20; // Adjust for navbar height
            const sectionBottom = sectionTop + section.offsetHeight;
            if (window.pageYOffset >= sectionTop && window.pageYOffset < sectionBottom) {
                activeSectionId = section.getAttribute('id');
            }
        });

        navLinksLi.forEach(li => {
            const link = li.querySelector('a');
            if (link) {
                link.classList.remove('active'); // Remove active from all links first

                const linkHref = link.getAttribute('href');
                const linkPath = linkHref.split('/').pop(); // Get filename or anchor

                if (currentPath === '' || currentPath === 'index.html') {
                    // Logic for homepage
                    if (linkHref.includes('#') && activeSectionId && linkHref.includes(activeSectionId)) {
                        link.classList.add('active');
                    } else if (!activeSectionId && (linkPath === 'index.html' || linkPath === '')) {
                        // If no section is active (e.g., at the very top), highlight Home
                        link.classList.add('active');
                    }
                } else {
                    // Logic for other pages (finance.html, login.html)
                    if (linkPath === currentPath) {
                        link.classList.add('active');
                    }
                }
            }
        });
    };

    // Initial highlight on load
    highlightActiveLink();
    // Highlight on scroll for homepage sections
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
        window.addEventListener('scroll', highlightActiveLink);
    }


    // Animate Elements on Scroll (Intersection Observer)
    const sections = document.querySelectorAll('.section');

    const observerOptions = {
        root: null,
        threshold: 0.1, // Trigger when 10% of the section is visible
        rootMargin: "0px"
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('appear');
                observer.unobserve(entry.target); // Stop observing once it has appeared
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        section.classList.add('fade-in'); // Add initial fade-in class
        observer.observe(section);
    });

});
