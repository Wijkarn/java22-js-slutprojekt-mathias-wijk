"use strict";
const apiKey = "474017e84ff7955c99cc107181f8f2db";

const imgContainer = document.querySelector("#imgContainer");
const button = document.querySelector("button");
const errorInfoEl = document.querySelector("#error");
const selectDownload = document.querySelector("#selectDownload");
const downBtnImg = document.querySelector("#download");

let per_page;
let size;
const per_pageDefaultAmount = 10;

let downloadImageSelect = false;

let linksToDownloadImage = [];
let linkAllImgArr = [];

button.addEventListener("click", getUserInput);

// gets the user's input from the form
function getUserInput(event) {
    event.preventDefault();
    linksToDownloadImage.length = 0;

    const searchInput = document.querySelector("#search").value;
    per_page = document.querySelector("#per_page").value;
    const sort = document.querySelector("#sort").value;
    size = document.querySelector("#size").value;

    if (navigator.onLine) {

        if (searchInput.length != 0) {
            errorInfoEl.innerHTML = "";

            if (per_page.length == 0) {
                per_page = per_pageDefaultAmount;
            }

            getApiResponse(searchInput, sort, per_page);
        }
        else {
            errorInfoEl.innerText = `Please fill in the search field.`;
        }
    }
    else{
        errorInfoEl.innerText = "Network error. Please check you connection!";
    }

    downloadImageSelect = false;
    removeSelected();
}

// sends api request and gets a response form the api
function getApiResponse(searchInput, sort, per_page) {
    const flickrApiUrl = `https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=${apiKey}&per_page=${per_page}&text=${searchInput}&sort=${sort}&safe_search=3&format=json&nojsoncallback=1`;

    fetch(flickrApiUrl)
        .then(response => {

            if (response.status >= 200 && response.status < 300) {
                return response.json();
            }

        })
        .then(showImage)
        .catch(error => {
            errorInfoEl.innerText = "There has been an error getting the images.";
            console.log(error);
        });
}

// prints out all images from the api on our page
function showImage(flickr) {
    const imagesFromFlickr = flickr.photos.photo.length;

    // checks if there are any images on screen
    if (linkAllImgArr == 0 && imagesFromFlickr == 0) {
        downBtnImg.style.display = "none";
        selectDownload.style.display = "none";
        downloadImageSelect = false;
    }

    linkAllImgArr.length = 0;

    //checks if there are any photos from the response
    if (flickr.photos.photo != 0) {
        selectDownload.style.display = "block";
        imgContainer.innerHTML = "";

        //prints out all images 
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
            img.className = "thumb";

            linkToImage.target = "_blank";
            linkToImage.href = imgSrc;
            linkToImage.class = "imageLink";

            linkAllImgArr[i] = imgSrc;
        }

        // sets icon to the first image
        const icon = document.querySelector("#icon");
        icon.href = `https://live.staticflickr.com/${flickr.photos.photo[0].server}/${flickr.photos.photo[0].id}_${flickr.photos.photo[0].secret}_s.jpg`;

    }
    else {
        errorInfoEl.innerText = "No images found. Please search for something else!";
    }

    // if we get less images than the user wanted
    if (per_page > imagesFromFlickr && imagesFromFlickr > 0) {
        errorInfoEl.innerText = `Did not find ${per_page} images. Only found ${imagesFromFlickr} image(s) was found.`;
    }
}

// removes all selected images
function removeSelected() {
    const thumbChecked = document.querySelectorAll(".thumbChecked");
    for (let i = 0; i < thumbChecked.length; i++) {
        thumbChecked[i].className = "thumb";
    }
}

//-------------------------------------DOWNLOAD IMAGES----------------------------------------------

// click on selectdownload button
selectDownload.addEventListener("click", event => {
    event.preventDefault();
    removeSelected();

    if (downloadImageSelect == true) {
        downloadImageSelect = false;
        linksToDownloadImage.length = 0;
        downBtnImg.style.display = "none";
    }
    else {
        downloadImageSelect = true;
    }
});

// selecting images the user want to download
$('#imgContainer').on('click', '.thumb', function (event) {
    if (downloadImageSelect) {

        $(this).removeClass().addClass('thumbChecked');
        linksToDownloadImage.push($(this).attr('src'));

        if (linksToDownloadImage.length != 0) {
            downBtnImg.style.display = "block";
        }
        event.preventDefault();
    }
});

// unselecting images the user has clicked on
$('#imgContainer').on('click', '.thumbChecked', function (event) {
    if (downloadImageSelect) {

        $(this).removeClass().addClass('thumb');
        let itemtoRemove = $(this).attr('src');
        linksToDownloadImage.splice($.inArray(itemtoRemove, linksToDownloadImage), 1);

        if (linksToDownloadImage.length == 0) {
            downBtnImg.style.display = "none";
        }
        event.preventDefault();
    }
});

//generates zip files with selected images
downBtnImg.addEventListener("click", generateZIP);
function generateZIP() {
    if (linksToDownloadImage != 0) {
        let zip = new JSZip();
        let count = 0;
        let zipFilename = "Flickr_pictures.zip";

        linksToDownloadImage.forEach(function (url, i) {
            let filename = linksToDownloadImage[i];
            filename = filename.replace(/[\/\*\|\:\<\>\?\"\\]/gi, '').replace("httpslive.staticflickr.com", "");
            // loading a file and add it in a zip file

            JSZipUtils.getBinaryContent(url, function (err, data) {
                if (err) {
                    throw err; // or handle the error
                }
                zip.file(filename, data, { binary: true });
                count++;
                if (count == linksToDownloadImage.length) {
                    zip.generateAsync({ type: 'blob' }).then(function (content) {
                        saveAs(content, zipFilename);
                    });
                }
            });
        });
    }
}