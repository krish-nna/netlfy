console.log("Script loaded! Checking modal elements...");

let categories = [];

// Define all functions first
function setupModalHandlers() {
  const addCategoryBtn = document.querySelector(".add-category-btn");
  const closeModalBtn = document.querySelector(".close");
  const modal = document.getElementById("competitionModal");

  if (addCategoryBtn) addCategoryBtn.addEventListener("click", openModal);
  if (closeModalBtn) closeModalBtn.addEventListener("click", closeModal);
  if (modal) modal.addEventListener("click", (event) => event.target === modal && closeModal());
}

function openModal() {
  const modal = document.getElementById("competitionModal");
  if (modal) modal.style.display = "flex";
}

function closeModal() {
  const modal = document.getElementById("competitionModal");
  if (modal) modal.style.display = "none";
}

function addCompetition() {
  const compName = document.getElementById("compName")?.value.trim();
  const compCategory = document.getElementById("compCategory")?.value.trim();
  const compCollege = document.getElementById("compCollege")?.value.trim();
  const compYear = document.getElementById("compYear")?.value.trim();

  if (!compName || !compCategory || !compCollege || !compYear) {
    alert("Please fill in all fields.");
    return;
  }

  fetch("save_competition.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: compName, category: compCategory, college: compCollege, year: compYear })
  })
    .then(response => response.json())
    .then(data => {
      if (data.error) return alert("Error: " + data.error);
      alert("Competition saved successfully!");
      resetForm();
      fetchCompetitions();
      closeModal();
    })
    .catch(error => alert("Failed to save competition: " + error));
}

function resetForm() {
  ["compName", "compCategory", "compCollege", "compYear"].forEach(id => document.getElementById(id).value = "");
}

function fetchCompetitions() {
  fetch("fetch_competitions.php")
    .then(response => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then(data => {
      console.log("Fetched Data:", data);

      if (!Array.isArray(data.categories)) {
        console.error("Expected categories to be an array but got:", data.categories);
        return;
      }

      categories = data.categories.map(category => ({
        name: category.category || "Unknown",
        competitions: JSON.parse(category.competitions || "[]")
      }));

      filters = {
        years: JSON.parse(data.filters.years || "[]"),
        categories: JSON.parse(data.filters.categories || "[]"),
        colleges: JSON.parse(data.filters.colleges || "[]")
      };

      updateDropdowns();
      updateCategoryTiles();
    })
    .catch(error => {
      console.error("Fetch Error:", error);
      alert("Failed to fetch competitions. Please try again later.");
    });
}

function updateDropdowns() {
  const categoryFilter = document.getElementById("filterCategory");
  const collegeFilter = document.getElementById("filterCollege");
  const yearFilter = document.getElementById("filterYear");

  [categoryFilter, collegeFilter, yearFilter].forEach(dropdown => {
    if (dropdown) dropdown.innerHTML = "<option value='all'>All</option>";
  });

  new Set(categories.map(c => c.name)).forEach(category => appendOption(categoryFilter, category));
  new Set(categories.flatMap(c => c.competitions.map(comp => comp.college))).forEach(college => appendOption(collegeFilter, college));
  new Set(categories.flatMap(c => c.competitions.map(comp => comp.year))).forEach(year => appendOption(yearFilter, year));
}

function appendOption(select, value) {
  if (!select) return;
  const option = document.createElement("option");
  option.value = value;
  option.textContent = value;
  select.appendChild(option);
}

function filterCompetitions() {
  const selectedCategory = document.getElementById("filterCategory")?.value;
  const selectedCollege = document.getElementById("filterCollege")?.value;
  const selectedYear = document.getElementById("filterYear")?.value;

  console.log("Selected Filters:", { selectedCategory, selectedCollege, selectedYear });

  const filtered = categories.map(category => ({
    name: category.name,
    competitions: category.competitions.filter(comp => {
      const matchesCategory = selectedCategory === "all" || category.name === selectedCategory;
      const matchesCollege = selectedCollege === "all" || comp.college === selectedCollege;
      const matchesYear = selectedYear === "all" || comp.year.toString() === selectedYear;
      return matchesCategory && matchesCollege && matchesYear;
    })
  })).filter(category => category.competitions.length);

  console.log("Filtered Competitions:", filtered);
  updateCategoryTiles(filtered);
}

function updateCategoryTiles(filteredCategories = categories) {
  const tilesContainer = document.getElementById("categoryTiles");
  tilesContainer.innerHTML = filteredCategories.length ? "" : "<p>No competitions found.</p>";

  filteredCategories.forEach(category => {
    category.competitions.forEach(competition => {
      const tile = document.createElement("div");
      tile.className = "competition-tile";
      tile.innerHTML = `
        <div class="info">
          <h3> ${competition.name}</h3>
          <p>Category: ${category.name}</p>
          <p>College: ${competition.college}</p>
          <p>Year: ${competition.year}</p>
        </div>
        <button type="button" onclick="viewCompetition('${competition.id}')">View Competition</button>
      `;
      tilesContainer.appendChild(tile);
    });
  });
}

function viewCompetition(compId) {
  // Redirect to student.html with the competition id in the query string
  window.location.href = `student.html?compId=${encodeURIComponent(compId)}`;
}

// Event listener for DOMContentLoaded
document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM Loaded");

  const addCategoryBtn = document.querySelector(".add-category-btn");
  const modal = document.getElementById("competitionModal");

  if (!addCategoryBtn) console.error("❌ Add Competition button not found!");
  if (!modal) console.error("❌ Modal not found!");

  setupModalHandlers();
  setupFilterHandlers();
  fetchCompetitions();
});

// Setup filter handlers
function setupFilterHandlers() {
  document.getElementById("filterCategory")?.addEventListener("change", filterCompetitions);
  document.getElementById("filterCollege")?.addEventListener("change", filterCompetitions);
  document.getElementById("filterYear")?.addEventListener("change", filterCompetitions);
}
