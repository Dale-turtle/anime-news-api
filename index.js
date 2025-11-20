import express from "express";
import axios from "axios";
import { parseStringPromise } from "xml2js";

const app = express();
const port = 3000;

// Middleware
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true })); // Replaces body-parser
app.set("view engine", "ejs");

// Routes
app.get("/", (req, res) => {
    res.render("index", { error: null });
});

// Helper function for API requests
async function fetchFromAPI(url) {
    console.log(`Fetching: ${url}`);
    try {
        const response = await axios.get(url);
        const result = await parseStringPromise(response.data, { explicitArray: false, mergeAttrs: true });
        return result;
    } catch (error) {
        console.error("API Error:", error.message);
        let errorMessage = "Failed to fetch data from Anime News Network. Please try again.";

        if (error.response) {
            if (error.response.status === 503) {
                errorMessage = "Server is busy (Rate Limit). Please wait a few seconds and try again.";
            } else if (error.response.status === 404) {
                errorMessage = "Resource not found.";
            }
        }
        throw new Error(errorMessage);
    }
}

app.post("/search", async (req, res) => {
    const query = req.body.query;

    if (!query) {
        return res.render("index", { error: "Please enter a search term." });
    }

    try {
        // ANN API Search: api.xml?title=~name
        const apiUrl = `https://cdn.animenewsnetwork.com/encyclopedia/api.xml?title=~${encodeURIComponent(query)}`;
        const result = await fetchFromAPI(apiUrl);

        // Debug logging
        // console.log("Parsed JSON:", JSON.stringify(result, null, 2));

        let items = [];

        // The ANN API structure varies. It usually returns <ann><anime>...</anime><manga>...</manga></ann>
        // We need to extract anime and manga items.
        if (result.ann) {
            const animeList = result.ann.anime ? (Array.isArray(result.ann.anime) ? result.ann.anime : [result.ann.anime]) : [];
            const mangaList = result.ann.manga ? (Array.isArray(result.ann.manga) ? result.ann.manga : [result.ann.manga]) : [];

            // Combine and map to a simpler structure
            items = [
                ...animeList.map(item => ({ id: item.id, name: item.name, type: 'anime' })),
                ...mangaList.map(item => ({ id: item.id, name: item.name, type: 'manga' }))
            ];
        }

        // Check for warning messages from API (sometimes it returns <warning> instead of data)
        if (result.ann && result.ann.warning) {
            console.log("API Warning:", result.ann.warning);
        }

        res.render("results", {
            results: items,
            searchQuery: query,
            error: items.length === 0 ? null : null
        });

    } catch (error) {
        res.render("index", { error: error.message });
    }
});

app.get("/anime/:id", async (req, res) => {
    const id = req.params.id;

    try {
        // Fetch details using the 'title' parameter which covers both anime and manga
        const apiUrl = `https://cdn.animenewsnetwork.com/encyclopedia/api.xml?title=${id}`;
        const result = await fetchFromAPI(apiUrl);

        // The root element is <ann>. Inside it could be <anime> or <manga>.
        // We need to find which one it is.
        let item = null;
        let type = 'Unknown';

        if (result.ann) {
            if (result.ann.anime) {
                item = result.ann.anime;
                type = 'Anime';
            } else if (result.ann.manga) {
                item = result.ann.manga;
                type = 'Manga';
            }
        }

        if (!item) {
            return res.render("details", { error: "Title not found.", title: "Not Found" });
        }

        // Extract data safely
        // Note: xml2js parsing behavior depends on whether there are multiple elements or one.
        // We need to handle arrays vs objects for things like info, genres, etc.

        const getInfo = (key) => {
            if (!item.info) return null;
            const infos = Array.isArray(item.info) ? item.info : [item.info];
            // info elements have attributes like type="Plot Summary" or type="Picture"
            // We look for the one matching the key
            const found = infos.find(i => i.type === key);
            return found ? (found._ || found.src) : null; // _ is text content, src is for images
        };

        const getArray = (key) => {
            if (!item.info) return [];
            const infos = Array.isArray(item.info) ? item.info : [item.info];
            return infos.filter(i => i.type === key).map(i => i._);
        };

        const title = item.name || "Unknown Title";
        const plot = getInfo("Plot Summary");
        const image = getInfo("Picture"); // Usually returns the src of the image
        const vintage = getInfo("Vintage");
        const genres = getArray("Genres");

        res.render("details", {
            title,
            type,
            plot,
            image,
            vintage,
            genres,
            error: null
        });

    } catch (error) {
        res.render("details", { error: error.message, title: "Error" });
    }
});

// 404 Handler
app.use((req, res) => {
    res.status(404).render("index", { error: "Page not found (404)." });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
