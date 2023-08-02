import fetch from 'node-fetch'
async function x() {
  
    try {

        const response = await fetch("https://lyx-f-p.onrender.com/api/v1/tours");
        const movies = await response.json();
        console.log(movies.data);
    } catch (err) {
        console.log(err);
    }
}

x();
