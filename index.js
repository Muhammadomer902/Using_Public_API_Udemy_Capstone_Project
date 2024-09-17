import express from "express";
import axios from "axios";
import bodyParser from "body-parser";

const app = express();
const port = 3000;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
    res.render("index", { choice: "", result: null });
});

app.post("/", async (req, res) => {
    const choice = req.body.type;
    if (choice === "random") {
        try {
            const response = await axios.get("https://www.thecocktaildb.com/api/json/v1/1/random.php");
            const result = response.data;
            res.render("index", { choice, result: result.drinks[0] });  // Send only the first drink
        } catch (error) {
            console.error("Error fetching random cocktail:", error);
            res.status(500).send("Internal Server Error");
        }
    } else {
        res.render("index", { choice, result: null });
    }
});

app.post("/search", async (req, res) => {
    const { cocktailName, cocktailId, cocktailAlphabet } = req.body;
    let apiUrl = "";
    let searchType = "";

    if (cocktailName) {
        apiUrl = `https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${cocktailName}`;
        searchType = "name";
    } else if (cocktailId) {
        apiUrl = `https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${cocktailId}`;
        searchType = "id";
    } else if (cocktailAlphabet) {
        apiUrl = `https://www.thecocktaildb.com/api/json/v1/1/search.php?f=${cocktailAlphabet}`;
        searchType = "alphabet";
    }

    try {
        const response = await axios.get(apiUrl);
        const result = response.data;

        if (result.drinks && result.drinks.length > 0) {
            res.render("index", { choice: searchType, result: result.drinks });
        } else {
            res.render("index", { choice: searchType, result: [] });
        }
    } catch (error) {
        console.error("Error fetching cocktail data:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.listen(port, () => {
    console.log(`Listening to port ${port}`);
});
