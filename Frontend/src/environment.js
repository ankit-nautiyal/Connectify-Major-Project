let IS_PROD=  true;

const server = IS_PROD ?
        "https://connectify-backend-9vrr.onrender.com" :

        "http://localhost:8000"

export default server;