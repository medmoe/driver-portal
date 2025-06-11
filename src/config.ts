const ENV = {
    dev: {
        API: "http://localhost:8000/",
    },
    prod: {
        API: "https://api.fleetmasters.net/"
    }
}

const getEnvVars = (env = import.meta.env.VITE_NODE_ENV || import.meta.env.MODE || 'development') => {
    if (env === 'development') {
        return ENV.dev;
    } else if (env === 'production') {
        return ENV.prod;
    }
    return ENV.dev;
}

export default getEnvVars;