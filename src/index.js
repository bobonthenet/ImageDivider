import Jimp from 'jimp';

function imageManip() {
  console.log('working on it...')
  document.getElementById("log").innerHTML = 'Working on it, this might take a while...';
  const outputNode = document.getElementById("output");
  while (outputNode.firstChild) {
    outputNode.removeChild(outputNode.firstChild);
  }

  let pagesWidth = document.getElementById("pagesWidth").value;
  let pagesHeight = document.getElementById("pagesHeight").value;
  let imgFile = document.getElementById("img").files[0];
  let reader = new FileReader();
  var dataUrl;
  var counter = 1;
  reader.onload = function () {
    dataUrl = reader.result;

    Jimp.read(dataUrl)
      .then(img => {
        let imgWidth = img.bitmap.width
        let imgHeight = img.bitmap.height

        let cropWidth = imgWidth / pagesWidth;
        let cropHeight = imgHeight / pagesHeight;

        for (let h = 0; h < pagesHeight; h++) {
          for (let w = 0; w < pagesWidth; w++) {

            statusUpdate(counter, pagesWidth * pagesHeight);

            let imgClone = img.clone();
            imgClone.crop(w * cropWidth, h * cropHeight, cropWidth, cropHeight);

            let thumbnail = imgClone.clone();
            generateThumbnail(counter, thumbnail);
            addPopupEvent(counter, imgClone);

            counter++;
          }
        }
      })
      .catch(err => {
        console.error(err);
      });
  };
  reader.readAsArrayBuffer(imgFile);
}

function generateThumbnail(index, img) {
  img.scaleToFit(255, 255);

  img.getBase64Async("image/png")
    .then(out => {
      let imgElm = document.createElement("img");
      imgElm.setAttribute("src", out);
      imgElm.setAttribute("id", `img${index}`);
      document.getElementById("output").appendChild(imgElm);
      document.getElementById("output").appendChild(document.createElement("hr"));
    })
}

function addPopupEvent(index, img) {
  img.getBase64Async("image/png")
    .then(out => {
      let thumbElm = document.getElementById(`img${index}`);
      let fullElm = document.createElement("img");
      fullElm.setAttribute("src", out);
      fullElm.setAttribute("style", "height: 100%; width: 100%; object-fit: contain");
      thumbElm.addEventListener("click", function () {
        var dpi_x = document.getElementById('dpi').offsetWidth;
        var dpi_y = document.getElementById('dpi').offsetHeight;
        var myWindow = window.open('', '', `width=${dpi_x * 8.5},height=${dpi_y * 11},menubar=1,titlebar=1,toolbar=1`);
        var doc = myWindow.document;
        doc.open();
        doc.write(fullElm.outerHTML);
        doc.write('<script>window.print();</script>');
        doc.close();
      })

    })
}

function statusUpdate(index, total) {
  console.log(`Generating image ${index} of ${total}`);
  document.getElementById("log").innerHTML = `Generating image ${index} of ${total}`;

  if (index == total) {
    console.log('Done!');
    document.getElementById("log").innerHTML = 'Done!<br>Click image thumbnail to open fullsize.'
  }
}

document.getElementById("imageButton").addEventListener("click", imageManip);