console.log("Script loaded! Checking modal elements...");

let categories = [];
let categorySuggestions = [];
let collegeSuggestions = [];

function setupModalHandlers() {
  const addCategoryBtn = document.querySelector(".add-category-btn");
  const closeModalBtn = document.querySelector(".close");
  const modal = document.getElementById("competitionModal");

  if (addCategoryBtn) addCategoryBtn.addEventListener("click", openModal);
  if (closeModalBtn) closeModalBtn.addEventListener("click", closeModal);
  if (modal) modal.addEventListener("click", (event) => event.target === modal && closeModal());
}

function openModal() {
  document.body.style.overflow = 'hidden';
  const modal = document.getElementById("competitionModal");
  if (modal) modal.style.display = "flex";
}

function closeModal() {
  document.body.style.overflow = '';
  const modal = document.getElementById("competitionModal");
  if (modal) modal.style.display = "none";
  // Also hide suggestion dropdowns if open
  hideSuggestions();
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

 fetch("https://rnder-8p34.onrender.com/save_competition.php", {
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
  hideSuggestions();
}

function fetchCompetitions() {
  fetch("https://rnder-8p34.onrender.com/fetch_competitions.php")
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

      // Extract unique category names
      categorySuggestions = [...new Set(categories.map(c => c.name))].sort();

      // Extract unique colleges from competitions
      collegeSuggestions = [...new Set(categories.flatMap(c => c.competitions.map(comp => comp.college)))].sort();

      updateDropdowns();
      updateCategoryTiles();

      // Setup or refresh suggestion dropdowns after data loaded
      setupSuggestionDropdowns();
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
      tile.innerHTML =
        `<div class="info">
          <h3>${competition.name}</h3>
          <p>Category: ${category.name}</p>
          <p>College: ${competition.college}</p>
          <p>Year: ${competition.year}</p>
        </div>
        <button type="button" onclick="viewCompetition('${competition.id}')">View Competition</button>`;
      tilesContainer.appendChild(tile);
    });
  });
}

function viewCompetition(compId) {
  // Redirect to student.html with the competition id in the query string
  window.location.href = `student.html?compId=${encodeURIComponent(compId)}`;
}

// Setup filter handlers
function setupFilterHandlers() {
  document.getElementById("filterCategory")?.addEventListener("change", filterCompetitions);
  document.getElementById("filterCollege")?.addEventListener("change", filterCompetitions);
  document.getElementById("filterYear")?.addEventListener("change", filterCompetitions);
}

// --- Suggestion dropdown logic starts here ---

// We'll maintain references to dropdown divs globally so we can reuse/hide them.
let categoryDropdown = null;
let collegeDropdown = null;

function setupSuggestionDropdowns() {
  const compCategoryInput = document.getElementById("compCategory");
  const compCollegeInput = document.getElementById("compCollege");

  // Create dropdown divs if not already created
  if (!categoryDropdown) {
    categoryDropdown = createDropdownDiv();
    document.body.appendChild(categoryDropdown);
  }
  if (!collegeDropdown) {
    collegeDropdown = createDropdownDiv();
    document.body.appendChild(collegeDropdown);
  }

  setupInputSuggestionHandlers(compCategoryInput, categorySuggestions, categoryDropdown);
  setupInputSuggestionHandlers(compCollegeInput, collegeSuggestions, collegeDropdown);
}

function createDropdownDiv() {
  const div = document.createElement("div");
  div.style.position = "absolute";
  div.style.border = "1px solid #ccc";
  div.style.backgroundColor = "#fff";
  div.style.zIndex = "1000";
  div.style.maxHeight = "150px";
  div.style.overflowY = "auto";
  div.style.boxShadow = "0 2px 6px rgba(0,0,0,0.15)";
  div.style.cursor = "pointer";
  div.style.fontSize = "14px";
  div.style.display = "none";
  div.style.borderRadius = "4px";
  return div;
}

function setupInputSuggestionHandlers(inputElem, suggestionsArray, dropdownDiv) {
  if (!inputElem) return;

  // Show suggestions on focus (full list)
  inputElem.addEventListener("focus", () => {
    showSuggestions(inputElem, suggestionsArray, dropdownDiv, "");
  });

  // Filter suggestions on input
  inputElem.addEventListener("input", () => {
    showSuggestions(inputElem, suggestionsArray, dropdownDiv, inputElem.value);
  });

  // Hide dropdown on blur, with timeout to allow click on options
  inputElem.addEventListener("blur", () => {
    setTimeout(() => {
      hideDropdown(dropdownDiv);
    }, 200);
  });

  // Handle clicks on dropdown options (event delegation)
  dropdownDiv.addEventListener("mousedown", (e) => {
    e.preventDefault(); // Prevent blur before click event
    if (e.target && e.target.dataset && e.target.dataset.value) {
      inputElem.value = e.target.dataset.value;
      hideDropdown(dropdownDiv);
    }
  });
}

function showSuggestions(inputElem, suggestionsArray, dropdownDiv, filterText) {
  // Filter suggestions case-insensitive
  let filtered = suggestionsArray.filter(item =>
    item.toLowerCase().includes(filterText.toLowerCase())
  );

  // If no matches, optionally show "No suggestions"
  if (filtered.length === 0) {
    dropdownDiv.innerHTML = `<div style="padding:6px;color:#666;">No suggestions</div>`;
  } else {
    dropdownDiv.innerHTML = filtered.map(item =>
      `<div style="padding:6px 10px;" data-value="${item}">${item}</div>`
    ).join("");
  }

  // Position dropdown below input
  const rect = inputElem.getBoundingClientRect();
  dropdownDiv.style.width = rect.width + "px";
  dropdownDiv.style.top = window.scrollY + rect.bottom + "px";
  dropdownDiv.style.left = window.scrollX + rect.left + "px";
  dropdownDiv.style.display = "block";
}

function hideDropdown(dropdownDiv) {
  if (dropdownDiv) {
    dropdownDiv.style.display = "none";
  }
}

function hideSuggestions() {
  hideDropdown(categoryDropdown);
  hideDropdown(collegeDropdown);
}

// --- End suggestion dropdown logic ---

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
