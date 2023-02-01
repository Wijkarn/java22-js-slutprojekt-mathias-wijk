"use strict";
const apiKey = "474017e84ff7955c99cc107181f8f2db";

const imgContainer = document.querySelector("#imgContainer");
const button = document.querySelector("button");
const errorEl = document.querySelector("#error");
let per_page;
let size;
const per_pageDefaultAmount = 10;
button.addEventListener("click", getUserInput);
let linkAllImgArr = [];

// gets the user's input from the form
function getUserInput(event) {
    event.preventDefault();
    linksToDownloadImage.length = 0;

    const searchInput = document.querySelector("#search").value;
    per_page = document.querySelector("#per_page").value;
    const sort = document.querySelector("#sort").value;
    size = document.querySelector("#size").value;

    if (searchInput.length != 0) {
        errorEl.innerHTML = "";

        if (per_page.length == 0) {
            per_page = per_pageDefaultAmount;
        }

        getApiResponse(searchInput, sort, per_page);
    }
    else {
        errorEl.innerText = `Please fill in the search field.`;
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
    linkAllImgArr.length = 0;

    //checks if there are any photos from the response
    if (flickr.photos.photo != 0) {
        selectDownload.style.display = "block";
        imgContainer.innerHTML = "";
        $('#download').css("display", "none");

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

            // linkToImage.target = "_blank";
            // linkToImage.href = imgSrc;
            linkToImage.class = "imageLink";
            setAElLink(i, imgSrc, true);
            linkAllImgArr[i] = imgSrc;
        }

        // sets icon to the first image
        const icon = document.querySelector("#icon");
        icon.href = `https://live.staticflickr.com/${flickr.photos.photo[0].server}/${flickr.photos.photo[0].id}_${flickr.photos.photo[0].secret}_s.jpg`;

    }
    else {
        errorEl.innerText = "No images found. Please search for something else!";
        selectDownload.style.display = "none";
        downloadImageSelect = false;
    }

    // if we get less images than the user wanted
    if (per_page > imagesFromFlickr && imagesFromFlickr > 0) {
        errorEl.innerText = `Did not find ${per_page} images. Only found ${imagesFromFlickr} image(s) was found.`;
    }
}

function setAElLink(i, link, target) {
    const aEl = document.querySelectorAll('a');
    aEl[i].href = link;
    if (target) {
        aEl[i].target = "_blank";
    }
    else {
        aEl[i].removeAttribute("target");
    }
}

function removeSelected() {
    const thumbChecked = document.querySelectorAll(".thumbChecked");
    for (let i = 0; i < thumbChecked.length; i++) {
        thumbChecked[i].className = "thumb";
    }
}

//-----------------------------------------------------------------------------------

let downloadImageSelect = false;
let linksToDownloadImage = [];
const selectDownload = document.querySelector("#selectDownload");

selectDownload.addEventListener("click", event => {
    event.preventDefault();
    removeSelected();
    if (downloadImageSelect == true) {
        downloadImageSelect = false;
        // console.log("1", downloadImageSelect);
        for (let i = 0; i < linkAllImgArr.length; i++) {
            setAElLink(i, linkAllImgArr[i], true);
        }
        linksToDownloadImage.length = 0;
        $('#download').css("display", "none");
    }
    else {
        downloadImageSelect = true;
        // console.log("2", downloadImageSelect);
        for (let i = 0; i < linkAllImgArr.length; i++) {
            setAElLink(i, "", false);
        }
    }
})

$('#imgContainer').on('click', '.thumb', function (event) {
    if (downloadImageSelect) {
        $(this).removeClass().addClass('thumbChecked');
        // $(this).css("border", "2px solid #c32032");
        linksToDownloadImage.push($(this).attr('src'));
        console.log(linksToDownloadImage);

        if (linksToDownloadImage.length != 0) {
            $('#download').css("display", "block");
        }
        event.preventDefault();
    }
});

$('#imgContainer').on('click', '.thumbChecked', function (event) {
    if (downloadImageSelect) {

        $(this).removeClass().addClass('thumb');
        let itemtoRemove = $(this).attr('src');
        linksToDownloadImage.splice($.inArray(itemtoRemove, linksToDownloadImage), 1);
        // console.log(linksToDownloadImage);

        if (linksToDownloadImage.length == 0) {
            $('#download').css("display", "none");
        }
        event.preventDefault();
    }
});

function generateZIP() {
    // console.log('TEST');
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
