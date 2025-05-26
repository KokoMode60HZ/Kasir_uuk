const express = require("express");
const app = express();
const connectDB = require("./config/db");
const path = require("path");
const session = require("express-session");
require("dotenv").config();
const port = process.env.PORT;
const userMiddleware = require("./middleware/user");



const authRoutes = require("./routes/authRoutes");
const produkRoutes = require("./routes/produkRoutes");
const penjualanRoutes = require("./routes/penjualanRoutes");
connectDB();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));



app.use(express.json());
app.use(express.urlencoded({ exten: true }));

app.use(
    session({
        secret: process.env.SESSION_SECRET || "secret-key",
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: false,
            maxAge: 1000 * 60 * 60 // 1 hour
        }
    })
);

app.use(userMiddleware);

app.get("/", (req, res) => {
    res.redirect("/auth/login");
});
app.use("/auth", authRoutes);
app.use("/produk", produkRoutes);
app.use("/penjualan", penjualanRoutes);

app.listen(port, () => {
    console.log(`Server started on http://localhost:${port}`);
});