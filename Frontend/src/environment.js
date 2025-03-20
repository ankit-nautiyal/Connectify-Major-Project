let IS_PROD =  import.meta.env.MODE === "production";

const server = IS_PROD 
        ? "https://connectify-backend-9vrr.onrender.com" 

        : import.meta.env.VITE_BACKEND_URL;

export default server;