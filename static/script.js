const fileInput = document.getElementById("fileInput");
const uploadArea = document.getElementById("uploadArea");
const uploadText = document.getElementById("uploadText");

uploadArea.addEventListener("click", () => {
    fileInput.click();
});

fileInput.addEventListener("change", () => {
    handleFile(fileInput.files[0]);
});

uploadArea.addEventListener("dragover", (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = "#00ffcc";
});

uploadArea.addEventListener("dragleave", () => {
    uploadArea.style.borderColor = "rgba(255,255,255,0.4)";
});

uploadArea.addEventListener("drop", (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = "rgba(255,255,255,0.4)";
    const file = e.dataTransfer.files[0];
    fileInput.files = e.dataTransfer.files;
    handleFile(file);
});

function handleFile(file) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        uploadArea.innerHTML =
            "<img src='" + e.target.result + "' />";
    };
    reader.readAsDataURL(file);
}

function uploadImage() {
    const file = fileInput.files[0];

    if (!file) {
        alert("Please select an image.");
        return;
    }

    document.getElementById("loading").style.display = "block";
    document.getElementById("resultCard").style.display = "none";

    const formData = new FormData();
    formData.append("image", file);

    fetch("/predict", {
        method: "POST",
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        document.getElementById("loading").style.display = "none";
        document.getElementById("resultCard").style.display = "block";

        const score = data.score;
        const bar = document.getElementById("confidenceFill");

        document.getElementById("resultText").innerHTML =
            "Result: " + data.label;

        document.getElementById("confidenceText").innerHTML =
            "Confidence Score: " + score.toFixed(3) +
            "<br>Risk Level: " + data.risk +
            "<br><br>" + data.interpretation;

        bar.style.width = (score * 100) + "%";

        if (score > 0.75) {
            bar.style.background = "#ff3b3b";
        } else if (score > 0.55) {
            bar.style.background = "#ffc107";
        } else {
            bar.style.background = "#00ffcc";
        }
    })
    .catch(() => {
        document.getElementById("loading").style.display = "none";
        alert("Error analyzing image.");
    });
}