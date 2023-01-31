"use strict";
const apiKey = "474017e84ff7955c99cc107181f8f2db";

const imgContainer = document.querySelector("#imgContainer");
const button = document.querySelector("button");
const errorEl = document.querySelector("#error");
let per_page;
let size;
const per_pageDefaultAmount = 10;
button.addEventListener("click", getUserInput);

// gets the user's input from the form
function getUserInput(event) {
    event.preventDefault();

    const searchInput = document.querySelector("#search").value;
    per_page = document.querySelector("#per_page").value;
    const sort = document.querySelector("#sort").value;
    size = document.querySelector("#size").value;

    if (searchInput.length != 0) {
        errorEl.innerHTML = "";
        imgContainer.innerHTML = "";

        if (per_page.length == 0) {
            per_page = per_pageDefaultAmount;
        }

        getApiResponse(searchInput, sort, per_page);
    }
    else {
        errorEl.innerText = `Please fill in the search field.`;
    }
}

// sends api request and gets a response form the api
function getApiResponse(searchInput, sort, per_page) {
    const flickrApiUrl = `https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=${apiKey}&per_page=${per_page}&text=${searchInput}&sort=${sort}&safe_search=3&format=json&nojsoncallback=1`;

    fetch(flickrApiUrl)
        .then(response => {

            if (response.status >= 200 && response.status < 300) {
                return response.json();
            }
            else if (response.status == 10 || response.status == 105) {
                errorEl.innerText = "Flickr API is currently not available. Try again later.";
                throw "Flickr API is currently not available.";
            } 
            else if (response.status == 100) {
                errorEl.innerText = "Flickr API key is invalid. Please contact server owner.";
                throw "Flickr API key is invalid.";
            }
        })
        .then(showImage)
        .catch(error => {
            errorEl.innerText = "Network error.";
            console.log(error);
        });
}

// prints out all images from the api on our page
function showImage(flickr) {
    const imagesFromFlickr = flickr.photos.photo.length;

    //checks if there are any photos from the response
    if (flickr.photos.photo != 0) {

        for (let i = 0; i < imagesFromFlickr; i++) {
            const linkToImage = document.createElement("a");
            const img = document.createElement("img");

            imgContainer.append(linkToImage);
            linkToImage.append(img);

            const id = flickr.photos.photo[i].id;
            const server = flickr.photos.photo[i].server;
            const secret = flickr.photos.photo[i].secret;

            let imgSrc = `https://live.staticflickr.com/${server}/${id}_${secret}_${size}.jpg`;
            img.src = imgSrc;

            linkToImage.target = "_blank";
            linkToImage.href = imgSrc;
            linkToImage.id = "imageLink";
        }

        // sets icon to the first image
        const icon = document.querySelector("#icon");
        icon.href = `https://live.staticflickr.com/${flickr.photos.photo[0].server}/${flickr.photos.photo[0].id}_${flickr.photos.photo[0].secret}_s.jpg`;

    }
    else {
        errorEl.innerText = "No images found. Please search for something else!";
    }

    // if we get less images than the user wanted
    if (per_page > imagesFromFlickr && imagesFromFlickr > 0) {
        errorEl.innerText = `Did not find ${per_page} images. Only found ${imagesFromFlickr} image(s) was found.`;
    }
}
