let toggleButton = document.getElementById("toggleButton");
let filters = document.getElementById("filters");

// Initialize the filters display based on the current window size
function updateFiltersDisplay() {
  if (window.innerWidth >= 1400) {
    filters.style.display = "flex";
    toggleButton.style.display = "none";
  } else {
    toggleButton.style.display = "block";
    filters.style.display = "none";
  }
}

// Add event listener to the toggle button
toggleButton.addEventListener("click", function () {
  if (filters.style.display === "none" || filters.style.display === "") {
    filters.style.display = "flex";
    toggleButton.textContent = "Hide Filters";
  } else {
    filters.style.display = "none";
    toggleButton.textContent = "Show Filters";
  }
});

window.addEventListener("resize", updateFiltersDisplay);

updateFiltersDisplay();

// Tax switch visibility toggle
let taxSwitch = document.getElementById("flexSwitchCheckDefault");
taxSwitch.addEventListener("click", () => {
  let taxInfo = document.getElementsByClassName("tax-info");
  for (let info of taxInfo) {
    if (info.style.display !== "inline") {
      info.style.display = "inline";
    } else {
      info.style.display = "none";
    }
  }
});
