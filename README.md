# Anime Discovery App

A web application that allows users to search for anime and manga using the Anime News Network (ANN) API.

## Features

- **Search**: Find anime and manga by title.
- **Details**: View detailed information including plot, genres, vintage, and images.
- **Responsive Design**: Works seamlessly on desktop and mobile devices.
- **Modern UI**: Clean and attractive interface built with custom CSS.

## Technology Stack

- **Backend**: Node.js, Express.js
- **Templating**: EJS
- **Styling**: Custom CSS (with CSS Variables and Flexbox/Grid)
- **API Integration**: Axios, xml2js (Anime News Network API)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher recommended)
- npm (Node Package Manager)

### Installation

1.  Clone the repository (or download the source code).
2.  Install dependencies:
    ```bash
    npm install
    ```

### Running the Application

1.  Start the server:
    ```bash
    node index.js
    ```
    Or if you have `nodemon` installed for development:
    ```bash
    nodemon index.js
    ```
2.  Open your browser and visit:
    ```
    http://localhost:3000
    ```

## Project Structure

- `public/`: Contains static assets like CSS files.
- `views/`: Contains EJS templates for the frontend (`index.ejs`, `results.ejs`, `details.ejs`).
- `index.js`: Main server file handling routes and API logic.

## API Reference

This application uses the [Anime News Network API](https://www.animenewsnetwork.com/encyclopedia/api.php).
- Search: `https://cdn.animenewsnetwork.com/encyclopedia/api.xml?title=~[QUERY]`
- Details: `https://cdn.animenewsnetwork.com/encyclopedia/api.xml?title=[ID]`

## License

This project is open source and available under the [ISC License](LICENSE).
