from flask import Flask, request, render_template, jsonify
import torch
import cv2
import numpy as np
from torchvision import transforms
from model import get_model

app = Flask(__name__)

DEVICE = torch.device("cpu")

model = get_model().to(DEVICE)
model.load_state_dict(torch.load("model.pth", map_location=DEVICE))
model.eval()

transform = transforms.Compose([
    transforms.ToPILImage(),
    transforms.Resize((224, 224)),
    transforms.ToTensor()
])

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/predict", methods=["POST"])
def predict():
    file = request.files["image"]
    npimg = np.frombuffer(file.read(), np.uint8)
    image = cv2.imdecode(npimg, cv2.IMREAD_COLOR)

    tensor = transform(image).unsqueeze(0)

    with torch.no_grad():
        output = model(tensor).item()

    label = "Deepfake Detected" if output > 0.5 else "Real Image"

    if output > 0.75:
        risk = "High Risk"
        interpretation = "Strong indicators of AI manipulation detected."
    elif output > 0.55:
        risk = "Moderate Risk"
        interpretation = "Some AI-generated characteristics found."
    else:
        risk = "Low Risk"
        interpretation = "Image appears authentic with low AI indicators."

    return jsonify({
        "label": label,
        "score": float(output),
        "risk": risk,
        "interpretation": interpretation
    })
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
