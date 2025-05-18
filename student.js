document.addEventListener("DOMContentLoaded", () => {
        const downloadBtn = document.getElementById("download-btn");

    if (downloadBtn) {
        downloadBtn.addEventListener("click", () => {
            console.log("Download button clicked!");

            const competitionId = new URLSearchParams(window.location.search).get("compId");
            if (!competitionId) {
                console.error("Competition ID is missing!");
                alert("Competition ID is required to download the template.");
                return;
            }

const downloadUrl = `https://rnder-8p34.onrender.com/download_template.php?compId=${competitionId}`;
window.location.href = downloadUrl;


            window.location.href = downloadUrl;
        });
    }
    // Get competition id from URL (using ?compId=xxx)
    const urlParams = new URLSearchParams(window.location.search);
    const competitionId = urlParams.get('compId');
    console.log("Competition ID:", competitionId);

    // Add event listener for the upload button
    const uploadBtn = document.getElementById("upload-btn");
    if (uploadBtn) {
        uploadBtn.addEventListener("click", (e) => {
            e.preventDefault(); // Prevent form submission if inside a form
            console.log("Upload button clicked!");
            handleFileUpload();
        });
    }

    // File input change to display chosen file name
    const fileInput = document.getElementById("upload-file");
    const fileNameDisplay = document.getElementById("file-name");
    if(fileInput && fileNameDisplay) {
      fileInput.addEventListener("change", () => {
          if (fileInput.files.length > 0) {
              fileNameDisplay.textContent = fileInput.files[0].name;
          } else {
              fileNameDisplay.textContent = "";
          }
      });
    }

    // Get new filter elements by new IDs:
    const filterClass = document.getElementById("filterClass");
    const filterRank = document.getElementById("filterRank");

    // Create a master list for class names; once loaded, we use it to update the dropdown
    let masterClassList = new Set();

    // Update event listeners for filters
    filterClass.addEventListener("change", fetchStudents);
    filterRank.addEventListener("change", fetchStudents);

    // Function to fetch students from the server based on filters and competition id
    function fetchStudents() {
        const cls = filterClass.value !== "all" ? filterClass.value : "";
        const rank = filterRank.value === "top3" ? "top3" : "all"; // Handle rank filter

        const query = `compId=${competitionId}&filter_class=${encodeURIComponent(cls)}&filter_rank=${encodeURIComponent(rank)}`;
        fetch("https://rnder-8p34.onrender.com/fetch_students.php?" + query)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    renderStudents(data.students);
                    // If master list is empty, populate it with all classes from fetched data.
                    if (masterClassList.size === 0) {
                        data.students.forEach(student => masterClassList.add(student.class));
                        updateClassDropdown([...masterClassList]);
                    }
                } else {
                    showError(data.error);
                }
            })
            .catch(err => {
                showError("Error fetching students");
            });
    }

    // Function to transform rank for display
    function getRankDisplay(rank) {
        // Assuming rank is stored as a string from the enum
        if (rank === "0") {
            return { text: "Participant", bgClass: "rank-participant" };
        } else if (rank === "1") {
            return { text: "1st rank", bgClass: "rank-gold" };
        } else if (rank === "2") {
            return { text: "2nd rank", bgClass: "rank-silver" };
        } else if (rank === "3") {
            return { text: "3rd rank", bgClass: "rank-bronze" };
        } else {
            return { text: rank, bgClass: "yellow-bg" };
        }
    }

    // Function to render student tiles
    // function renderStudents(students) {
    //     const container = document.getElementById("categoryTiles");
    //     container.innerHTML = ""; // Clear previous tiles
    //     students.forEach(student => {
    //         const rankInfo = getRankDisplay(student.rank_status);
    //         const tile = document.createElement("div");
    //         tile.classList.add("tile");
    //         tile.innerHTML = `
    //             <div class="student-card">
    //                 <p class="student-name"><u>${student.name}</u></p>
    //                 <p class="student-id"><strong>Student ID:</strong> ${student.student_id}</p>
    //                 <p class="student-class"><strong>Class:</strong> ${student.class}</p>
    //                 <p class="student-division"><strong>Division:</strong> ${student.division}</p>
    //                 <p class="student-rollno"><strong>Roll No:</strong> ${student.rollno}</p>
    //                 <div class="rank-container">
    //                     <span class="rank-badge ${rankInfo.bgClass}">${rankInfo.text}</span>
    //                 </div>
    //                 <p class="email"><strong>Email:</strong> ${student.email}</p>
    //                 <p class="student-phone"><strong>Phone:</strong> ${student.phno}</p>
    //                 <div class="edit-btn" style="border: none; cursor: pointer;" data-tid="${student.tid}">
    //                     <img class="edit" src="edit.png" alt="Edit">
    //                 </div>
    //             </div>
    //         `;
    //         container.appendChild(tile);
    //     });
    //     // Bind edit button click events
    //     document.querySelectorAll(".edit-btn").forEach(btn => {
    //         btn.addEventListener("click", openEditModal);
    //     });
    // }

//         function renderStudents(students) {
//     const container = document.getElementById("studinfo");
//     container.innerHTML = ""; // Clear previous content

//     // Create the table and its header
//     const table = document.createElement("table");
//     table.classList.add("students-table");
  

//     const headerRow = document.createElement("tr");
//     headerRow.innerHTML = `
//         <th class="tabelh">Name</th>
//         <th class="tabelh1">Student ID</th>
//         <th class="tabelh2">Class</th>
//         <th class="tabelh3">Division</th>
//         <th class="tabelh4">Roll No</th>
//         <th class="tabelh5">Rank</th>
//         <th class="tabelh6">Email</th>
//         <th class="tabelh7">Phone</th>
//         <th class="tabelh8">Edit</th>
//     `;
//     table.appendChild(headerRow);

//     // Add a row for each student
//     students.forEach(student => {
//         const rankInfo = getRankDisplay(student.rank_status);
//         const row = document.createElement("tr");

//         row.innerHTML = `
//             <td class="sdata"><u class="sname">${student.name}</u></td>
//             <td class="sdata1">${student.student_id}</td>
//             <td class="sdata2">${student.class}</td>
//             <td class="sdata3">${student.division}</td>
//             <td class="sdata4">${student.rollno}</td>
//             <td class="sdata5"><span class="rank-badge ${rankInfo.bgClass}">${rankInfo.text}</span></td>
//             <td class="sdata6">${student.email}</td>
//             <td class="sdata7">${student.phno}</td>
//             <td class="sdata8">
//                 <div class="edit-btn" style="border: none; cursor: pointer;" data-tid="${student.tid}">
//                     <img class="edit" src="edit.png" alt="Edit">
//                 </div>
//             </td>
//         `;

//         table.appendChild(row);
//     });

//     // Append the table to the container
//     container.appendChild(table);

//     // Bind edit button click events
//     document.querySelectorAll(".edit-btn").forEach(btn => {
//         btn.addEventListener("click", openEditModal);
//     });
// }

function renderStudents(students) {
    const container = document.getElementById("studinfo");
    container.innerHTML = ""; // Clear previous content

    const table = document.createElement("table");
    table.classList.add("students-table");

    const headerRow = document.createElement("tr");
    headerRow.innerHTML = `
        <th class="col-name">Name</th>
        <th class="col-id">Student ID</th>
        <th class="col-rank">Rank</th>
        <th class="col-toggle"></th>
        <th class="col-class full-only">Class</th>
        <th class="col-div full-only">Division</th>
        <th class="col-roll full-only">Roll No</th>
        <th class="col-email full-only">Email</th>
        <th class="col-phone full-only">Phone</th>
        <th class="col-edit full-only">Edit</th>
    `;
    table.appendChild(headerRow);

    students.forEach((student, index) => {
        const rankInfo = getRankDisplay(student.rank_status);
        const row = document.createElement("tr");
        row.classList.add("main-row");

        row.innerHTML = `
            <td class="col-name"><u>${student.name}</u></td>
            <td class="col-id">${student.student_id}</td>
          
           
            <td class="col-class full-only">${student.class}</td>
            <td class="col-div full-only">${student.division}</td>
            <td class="col-roll full-only">${student.rollno}</td>
              <td class="col-rank"><span class="rank-badge ${rankInfo.bgClass}">${rankInfo.text}</span></td>
               <td class="col-toggle"><button class="toggle-popup" data-index="${index}"><img class="drop" src="drop.png" alt="drop"></button></td>
            <td class="col-email full-only">${student.email}</td>
            <td class="col-phone full-only">${student.phno}</td>
            <td class="col-edit full-only">
                <div class="edit-btn" style="border: none; cursor: pointer;" data-tid="${student.tid}">
                    <img class="edit" src="edit.png" alt="Edit">
                </div>
            </td>
        `;
        table.appendChild(row);

        const popupRow = document.createElement("tr");
        popupRow.classList.add("popup-row");
        popupRow.setAttribute("data-index", index);
        popupRow.style.display = "none";

        popupRow.innerHTML = `
            <td colspan="10">
                <div class="popup-content">
                    <p><strong>Class:</strong> ${student.class}</p>
                    <p><strong>Division:</strong> ${student.division}</p>
                    <p><strong>Roll No:</strong> ${student.rollno}</p>
                    <p><strong>Email:</strong> ${student.email}</p>
                    <p><strong>Phone:</strong> ${student.phno}</p>
                    <div class="edit-btn" style="border: none; cursor: pointer;" data-tid="${student.tid}">
                        <img class="edit" src="edit.png" alt="Edit">
                    </div>
                </div>
            </td>
        `;
        table.appendChild(popupRow);
    });

    container.appendChild(table);
    

    // Handle toggle popup logic
    document.querySelectorAll(".toggle-popup").forEach(btn => {
        btn.addEventListener("click", e => {
            const index = e.currentTarget.getAttribute("data-index");
            document.querySelectorAll(".popup-row").forEach(row => {
                if (row.getAttribute("data-index") === index) {
                    row.style.display = (row.style.display === "table-row") ? "none" : "table-row";
                } else {
                    row.style.display = "none";
                }
            });
        });
    });

    // Bind edit buttons
    document.querySelectorAll(".edit-btn").forEach(btn => {
        btn.addEventListener("click", openEditModal);
    });
}



    // Function to update the class dropdown using the master list
    function updateClassDropdown(classes) {
        // Clear previous options and add default "All Classes"
        filterClass.innerHTML = `<option value="all">All Classes</option>`;
        classes.forEach(cls => {
            const option = document.createElement("option");
            option.value = cls;
            option.textContent = cls;
            filterClass.appendChild(option);
        });
    }

    // Function to show errors
    function showError(message) {
        const errorDiv = document.getElementById("error-message");
        errorDiv.textContent = message;
        setTimeout(() => {
            errorDiv.textContent = "";
        }, 5000);
    }

    // Function to open the edit modal and prefill with student data
    function openEditModal(e) {
        const tid = e.target.closest(".edit-btn").getAttribute("data-tid");
        // Use closest to find the student-card container
       const row = e.target.closest("tr");
        if (!row) {
            console.error("row not found!");
            return;
        }
        

        // Extract fields using unique class selectors
        const nameEl = row.querySelector(".col-name");
        const classEl = row.querySelector(".col-class");
        const divisionEl = row.querySelector(".col-div");
        const rollnoEl = row.querySelector(".col-roll");
        const emailEl = row.querySelector(".col-email");
        const phoneEl = row.querySelector(".col-phone");
        const rankEl = row.querySelector("span.rank-badge");

        const name = nameEl ? nameEl.textContent.replace(/<[^>]*>/g, "").trim() : "";
        const classText = classEl ? classEl.textContent.split(": ")[1] : "";
        const divisionText = divisionEl ? divisionEl.textContent.split(": ")[1] : "";
        const rollnoText = rollnoEl ? rollnoEl.textContent.split(": ")[1] : "";
        const email = emailEl ? emailEl.textContent.split(": ")[1] : "";
        const phoneText = phoneEl ? phoneEl.textContent.split(": ")[1] : "";
        const rank_status = rankEl ? rankEl.textContent : "";
console.log("Extracted values:");
console.log("name:", name);
console.log("classText:", classText);
console.log("divisionText:", divisionText);
console.log("rollnoText:", rollnoText);
console.log("email:", email);
console.log("phoneText:", phoneText);

        if (!name || !classText || !divisionText || !rollnoText || !email || !phoneText) {
            console.error("Some student details are missing!");
            return;
        }

        // Create modal content dynamically
        const modal = document.createElement("div");
        modal.classList.add("modal");
        modal.style.display = "flex"; // Ensure modal is visible
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-btn">&times;</span>
                <h3>Edit Student</h3>
                <form id="edit-form">
                    <input type="hidden" name="tid" value="${tid}">
                    <label>Name: <input type="text" name="name" value="${name}" required></label>
                    <label>Class: <input type="text" name="class" value="${classText}" required></label>
                    <label>Division: <input type="text" name="division" value="${divisionText}" required></label>
                    <label>Roll No: <input type="number" name="rollno" value="${rollnoText}" required></label>
                    <label>Email: <input type="email" name="email" value="${email}" required></label>
                    <label>Phone: <input type="text" name="phno" value="${phoneText}" required></label>
                    <label>Rank Status: 
                        <select name="rank_status" required>
                            <option value="1" ${rank_status === "1st rank" ? 'selected' : ''}>1</option>
                            <option value="2" ${rank_status === "2nd rank" ? 'selected' : ''}>2</option>
                            <option value="3" ${rank_status === "3rd rank" ? 'selected' : ''}>3</option>
                            <option value="0" ${rank_status === "Participant" ? 'selected' : ''}>Participant</option>
                        </select>
                    </label>
                    <button type="submit">Save Changes</button>
                    <button type="button" id="delete-btn">Delete</button>
                </form>
            </div>
        `;
        document.body.appendChild(modal);

        // Close modal event
        modal.querySelector(".close-btn").addEventListener("click", () => {
            modal.remove();
        });

        // Handle form submission (update)
   // Handle form submission (update)
modal.querySelector("#edit-form").addEventListener("submit", function (ev) {
    ev.preventDefault();
    console.log("Edit form submitted"); // Debug log
    const formData = new FormData(this);
    console.log("FormData:", formData); // Debug log
  fetch("https://rnder-8p34.onrender.com/update_students.php", {
    method: "POST",
    body: formData
})

        .then(response => {
            console.log("Update response:", response); // Debug log
            return response.json();
        })
        .then(data => {
            console.log("Update data:", data); // Debug log
            if (data.success) {
                modal.remove();
                fetchStudents();
            } else {
                showError(data.error);
            }
        })
        .catch(err => {
            console.error("Update error:", err); // Debug log
            showError("Error updating student");
        });
});

        // Handle deletion
        modal.querySelector("#delete-btn").addEventListener("click", function () {
            console.log("Delete button clicked");
            console.log("TID to delete:", tid);
        
            if (confirm("Are you sure you want to delete this student?")) {
                const formData = new FormData();
                formData.append("tid", tid);
                console.log("Delete FormData:", formData);
        
              fetch("https://rnder-8p34.onrender.com/delete_students.php", {
    method: "POST",
    body: formData
})

                    .then(response => {
                        console.log("Delete response:", response);
                        return response.json();
                    })
                    .then(data => {
                        console.log("Delete data:", data);
                        if (data.success) {
                            modal.remove();
                            fetchStudents();
                        } else {
                            showError(data.error);
                        }
                    })
                    .catch(err => {
                        console.error("Delete error:", err);
                        showError("Error deleting student");
                    });
            }
        });
    }

    // Handle Excel file upload
   function handleFileUpload() {
    console.log("handleFileUpload function called!");

    const fileInput = document.getElementById("upload-file");
    console.log("File input element:", fileInput);

    if (!fileInput) {
        console.error("File input not found!");
        showError("File input element is missing.");
        return;
    }

    const file = fileInput.files[0];
    console.log("Selected file:", file);

    if (!file) {
        showError("Please choose an Excel file to upload.");
        return;
    }

    const formData = new FormData();
    formData.append("excel_file", file);
    formData.append("competition_id", competitionId);

    // Log FormData contents
    for (let [key, value] of formData.entries()) {
        console.log(key, value);
    }

    fetch("https://rnder-8p34.onrender.com/save_students.php", {
        method: "POST",
        body: formData
    })
        .then(response => {
            console.log("Fetch response received:", response);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json().catch(() => {
                throw new Error("Invalid JSON response from server.");
            });
        })
        .then(data => {
            console.log("Server response data:", data);
            if (data.success) {
                fetchStudents(); // Refresh the student list after upload
            } else {
                showError(data.error);
            }
        })
        .catch((err) => {
            console.error("Fetch error:", err);
            showError("Error uploading file: " + err.message);
        });
}
    // Initially fetch students for the competition
    fetchStudents();
});


