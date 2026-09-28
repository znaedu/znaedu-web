const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(__dirname));

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    project: "Bon Plan 229",
    status: "online",
    time: new Date().toISOString()
  });
});

app.get("/api/announcements", (req, res) => {
  res.json({
    success: true,
    announcements: []
  });
});

app.post("/api/announcements", (req, res) => {
  const { title, description, price, category, location } = req.body;

  if (!title || !description) {
    return res.status(400).json({
      success: false,
      message: "Le titre et la description sont obligatoires."
    });
  }

  res.status(201).json({
    success: true,
    announcement: {
      title,
      description,
      price: Number(price || 0),
      category: category || "Autre",
      location: location || "",
      status: "pending"
    }
  });
});

app.get("/api/orders", (req, res) => {
  res.json({
    success: true,
    orders: []
  });
});

app.post("/api/orders", (req, res) => {
  const { announcementId, amount } = req.body;

  if (!announcementId || !amount) {
    return res.status(400).json({
      success: false,
      message: "L'annonce et le montant sont obligatoires."
    });
  }

  res.status(201).json({
    success: true,
    order: {
      announcementId,
      amount: Number(amount),
      status: "pending",
      paymentStatus: "pending"
    }
  });
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Bon Plan 229 lancé sur le port ${PORT}`);
});
