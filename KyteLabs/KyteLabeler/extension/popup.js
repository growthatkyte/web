document.addEventListener('DOMContentLoaded', function () {
    var generateButton = document.getElementById('generateButton');
    if (generateButton) {
        generateButton.addEventListener('click', function () {
            var xmlUrl = document.getElementById('xmlUrl').value;
            var labelSize = document.getElementById('labelSize').value;

            fetch('http://localhost:3000/generate-barcodes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ xmlUrl: xmlUrl, size: labelSize })
            })
                .then(response => response.blob())
                .then(blob => {
                    const url = window.URL.createObjectURL(blob);
                    chrome.downloads.download({
                        url: url,
                        filename: 'barcodes.pdf' // Optional: specify a filename for the download
                    });
                })
                .catch(error => {
                    console.log(error); // Log the error for debugging
                    // Handle error
                });
        });
    }

    var catalogButton = document.querySelector('.catalog-btn');
    if (catalogButton) {
        catalogButton.addEventListener('click', toggleSections);
    }
});

function toggleSections() {
    var labelSection = document.getElementById('labelGeneratorSection');
    var barcodeSection = document.getElementById('barcodeGeneratorSection');

    if (labelSection.style.display !== 'none') {
        labelSection.style.display = 'none';
        barcodeSection.style.display = 'block';
    } else {
        labelSection.style.display = 'block';
        barcodeSection.style.display = 'none';
    }
}
