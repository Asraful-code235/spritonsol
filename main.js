document.addEventListener("DOMContentLoaded", () => {
  const uploadButton = document.getElementById("uploadButton");
  const uploadInput = document.getElementById("upload");
  const maskSelect = document.getElementById("maskSelect");
  const maskSelectContainer = document.querySelector(".select-container");
  const addMaskButton = document.getElementById("addMask");
  const addLaserEyesButton = document.getElementById("addLaserEyes");
  const downloadButton = document.getElementById("downloadImage");
  const viewButton = document.getElementById("viewImage");
  const undoButton = document.getElementById("undoImage");
  const imageContainer = document.querySelector(".image-container");

  const uploadBannerButton = document.getElementById("uploadBannerButton");
  const uploadBannerInput = document.getElementById("uploadBanner");
  const addBannerButton = document.getElementById("addBanner");
  const downloadBannerButton = document.getElementById("downloadBannerImage");
  const viewBannerButton = document.getElementById("viewBannerImage");
  const undoBannerButton = document.getElementById("undoBannerImage");
  const bannerContainer = document.querySelector(".banner-container");

  // Stack to keep track of added elements
  const undoStack = [];
  const undoBannerStack = [];

  uploadButton.addEventListener("click", () => {
    uploadInput.click();
  });

  uploadInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const image = document.getElementById("uploadedImage");
        image.src = e.target.result;
        image.style.display = "block"; // Ensure the image is displayed

        // const overlay = document.querySelector(".overlay");
        // overlay.style.display = "block"; // Ensure the overlay is displayed

        const placeholder = document.querySelector(".image-placeholder");
        placeholder.style.display = "none"; // Hide placeholder

        // Remove existing masks and laser eyes
        undoStack.length = 0; // Clear undo stack on new image upload

        const existingMasks = document.querySelectorAll(".resizable-mask");
        existingMasks.forEach((mask) => mask.remove());

        const existingLaserEyes = document.querySelectorAll(".laser-eyes");
        existingLaserEyes.forEach((laserEye) => laserEye.remove());

        // Show buttons and mask selection
        maskSelectContainer.style.display = "inline-block";
        addMaskButton.style.display = "inline-block";
        addLaserEyesButton.style.display = "inline-block";
        downloadButton.style.display = "inline-block";
        viewButton.style.display = "inline-block";
        undoButton.style.display = "inline-block";
      };
      reader.readAsDataURL(file);
    }
  });

  addMaskButton.addEventListener("click", () => {
    const hatImage = document.createElement("img");
    hatImage.src = "hat.png";
    hatImage.alt = "Hat";
    hatImage.className = "resizable-mask";
    hatImage.style.display = "block";

    // Position the hat on top of the image
    const containerRect = imageContainer.getBoundingClientRect();
    hatImage.style.position = "absolute";
    hatImage.style.left = `${containerRect.width / 2 - 50}px`; // Center horizontally
    hatImage.style.top = `0px`; // Place at the top of the image
    hatImage.style.width = "100px"; // Initial size
    hatImage.style.height = "auto"; // Maintain aspect ratio

    imageContainer.appendChild(hatImage);
    makeDraggable(hatImage); // Make the hat draggable and resizable

    // Push to undo stack
    undoStack.push(hatImage);
  });

  addLaserEyesButton.addEventListener("click", () => {
    const laserEyesImage = document.createElement("img");
    laserEyesImage.src = "sticker.png";
    laserEyesImage.alt = "Laser Eyes";
    laserEyesImage.className = "resizable-mask laser-eyes";
    laserEyesImage.style.display = "block";

    const containerRect = imageContainer.getBoundingClientRect();
    laserEyesImage.style.position = "absolute";
    laserEyesImage.style.left = `${(containerRect.width - 100) / 2}px`; // Center horizontally
    laserEyesImage.style.top = `${(containerRect.height - 100) / 2}px`; // Center vertically
    laserEyesImage.style.width = "100px"; // Initial size
    laserEyesImage.style.height = "auto"; // Maintain aspect ratio

    imageContainer.appendChild(laserEyesImage);
    makeDraggable(laserEyesImage); // Make the laser eyes draggable and resizable

    // Push to undo stack
    undoStack.push(laserEyesImage);
  });

  function makeDraggable(element) {
    let isResizing = false;
    let offsetX, offsetY;

    element.addEventListener("mousedown", startDragging);
    element.addEventListener("touchstart", startDragging);

    function startDragging(e) {
      e.preventDefault(); // Prevent default behavior (text selection)

      const event = e.type === "touchstart" ? e.touches[0] : e;

      if (
        event.target.classList.contains("resizable-mask") &&
        (event.offsetX > element.clientWidth - 10 ||
          event.offsetY > element.clientHeight - 10)
      ) {
        isResizing = true;
        document.addEventListener("mousemove", resizeElement);
        document.addEventListener("touchmove", resizeElement);
        document.addEventListener("mouseup", stopResizeElement);
        document.addEventListener("touchend", stopResizeElement);
      } else {
        offsetX = event.clientX - element.getBoundingClientRect().left;
        offsetY = event.clientY - element.getBoundingClientRect().top;

        document.addEventListener("mousemove", moveElement);
        document.addEventListener("touchmove", moveElement);
        document.addEventListener("mouseup", stopMovingElement);
        document.addEventListener("touchend", stopMovingElement);
      }
    }

    function moveElement(e) {
      const event = e.type === "touchmove" ? e.touches[0] : e;
      const containerRect = imageContainer.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();

      let left = event.clientX - offsetX - containerRect.left;
      let top = event.clientY - offsetY - containerRect.top;

      // Prevent the element from being dragged outside the container
      if (left < 0) left = 0;
      if (top < 0) top = 0;
      if (left + elementRect.width > containerRect.width)
        left = containerRect.width - elementRect.width;
      if (top + elementRect.height > containerRect.height)
        top = containerRect.height - elementRect.height;

      element.style.left = `${left}px`;
      element.style.top = `${top}px`;
    }

    function stopMovingElement() {
      document.removeEventListener("mousemove", moveElement);
      document.removeEventListener("touchmove", moveElement);
      document.removeEventListener("mouseup", stopMovingElement);
      document.removeEventListener("touchend", stopMovingElement);
    }

    function resizeElement(e) {
      const event = e.type === "touchmove" ? e.touches[0] : e;
      const containerRect = imageContainer.getBoundingClientRect();

      let newWidth = event.clientX - element.getBoundingClientRect().left;
      let newHeight = event.clientY - element.getBoundingClientRect().top;

      // Prevent the element from being resized outside the container
      if (
        newWidth + element.getBoundingClientRect().left >
        containerRect.right
      ) {
        newWidth = containerRect.right - element.getBoundingClientRect().left;
      }
      if (
        newHeight + element.getBoundingClientRect().top >
        containerRect.bottom
      ) {
        newHeight = containerRect.bottom - element.getBoundingClientRect().top;
      }

      element.style.width = `${newWidth}px`;
      element.style.height = `${newHeight}px`;
    }

    function stopResizeElement() {
      document.removeEventListener("mousemove", resizeElement);
      document.removeEventListener("touchmove", resizeElement);
      document.removeEventListener("mouseup", stopResizeElement);
      document.removeEventListener("touchend", stopResizeElement);
      isResizing = false;
    }
  }

  document
    .getElementById("downloadImage")
    .addEventListener("click", function () {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      const image = document.getElementById("uploadedImage");
      const container = document.querySelector(".image-container");
      const containerRect = container.getBoundingClientRect();

      // Set canvas dimensions
      canvas.width = containerRect.width;
      canvas.height = containerRect.height;

      // Draw the image on the canvas
      context.drawImage(image, 0, 0, canvas.width, canvas.height);

      // Create a new canvas to apply the overlay effect
      const overlayCanvas = document.createElement("canvas");
      overlayCanvas.width = canvas.width;
      overlayCanvas.height = canvas.height;
      const overlayContext = overlayCanvas.getContext("2d");

      // Draw the overlay on the overlay canvas
      overlayContext.fillStyle = "rgba(0, 0, 0, 0)"; // Overlay color
      overlayContext.fillRect(0, 0, overlayCanvas.width, overlayCanvas.height);

      // Apply the overlay effect to the image
      context.globalCompositeOperation = "multiply"; // Apply the overlay
      context.drawImage(overlayCanvas, 0, 0); // Draw the overlay

      // Reset globalCompositeOperation
      context.globalCompositeOperation = "source-over";

      // Draw masks and laser eyes
      const masks = document.querySelectorAll(".resizable-mask");
      masks.forEach((mask) => {
        const maskRect = mask.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const x = maskRect.left - containerRect.left;
        const y = maskRect.top - containerRect.top;
        const width = mask.offsetWidth;
        const height = mask.offsetHeight;

        context.drawImage(mask, x, y, width, height);
      });

      const laserEyes = document.querySelectorAll(".laser-eyes");
      laserEyes.forEach((laserEye) => {
        const laserEyeRect = laserEye.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const x = laserEyeRect.left - containerRect.left;
        const y = laserEyeRect.top - containerRect.top;
        const width = laserEye.offsetWidth;
        const height = laserEye.offsetHeight;

        context.drawImage(laserEye, x, y, width, height);
      });

      // Create a download link and trigger download
      const downloadLink = document.createElement("a");
      downloadLink.href = canvas.toDataURL("image/png");
      downloadLink.download = "christmasHat.png";
      downloadLink.click();
    });

  viewButton.addEventListener("click", () => {
    imageContainer.classList.toggle("no-resize"); // Toggle visibility of resize dashed borders
    viewButton.textContent =
      viewButton.textContent === "View" ? "Edit" : "View"; // Toggle button text
  });

  undoButton.addEventListener("click", () => {
    if (undoStack.length > 0) {
      const lastElement = undoStack.pop();
      lastElement.remove(); // Remove the last added mask or laser eyes
    }
  });

  // Banner upload and manipulation
  uploadBannerButton.addEventListener("click", () => {
    uploadBannerInput.click();
  });

  uploadBannerInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const bannerImage = document.getElementById("uploadedBannerImage");
        bannerImage.src = e.target.result;
        bannerImage.style.display = "block"; // Ensure the image is displayed
        bannerImage.style.width = "1500px"; // Set image width
        bannerImage.style.height = "500px"; // Set image height

        const placeholder = document.querySelector(
          ".banner-container .image-placeholder"
        );
        placeholder.style.display = "none"; // Hide placeholder

        // Remove existing banners
        undoBannerStack.length = 0; // Clear undo stack on new image upload

        const existingBanners = document.querySelectorAll(".banner");
        existingBanners.forEach((banner) => banner.remove());

        // Show buttons
        addBannerButton.style.display = "inline-block";
        downloadBannerButton.style.display = "inline-block";
        viewBannerButton.style.display = "inline-block";
        undoBannerButton.style.display = "inline-block";
      };
      reader.readAsDataURL(file);
    }
  });

  addBannerButton.addEventListener("click", () => {
    const bannerImage = document.createElement("img");
    bannerImage.src = "q.png";
    bannerImage.alt = "Banner";
    bannerImage.className = "resizable-mask banner";
    bannerImage.style.display = "block";

    const containerRect = bannerContainer.getBoundingClientRect();
    bannerImage.style.position = "absolute";
    bannerImage.style.left = `${(containerRect.width - 100) / 2}px`; // Center horizontally
    bannerImage.style.top = `${(containerRect.height - 100) / 2}px`; // Center vertically
    bannerImage.style.width = "100px"; // Initial size
    bannerImage.style.height = "auto"; // Maintain aspect ratio

    bannerContainer.appendChild(bannerImage);
    makeBannerDraggable(bannerImage); // Make the banner draggable and resizable

    // Push to undo stack
    undoBannerStack.push(bannerImage);
  });

  function makeBannerDraggable(element) {
    let isResizing = false;
    let offsetX, offsetY;

    element.addEventListener("mousedown", startDragging);
    element.addEventListener("touchstart", startDragging);

    function startDragging(e) {
      e.preventDefault(); // Prevent default behavior (text selection)

      const event = e.type === "touchstart" ? e.touches[0] : e;

      if (
        event.target.classList.contains("resizable-mask") &&
        (event.offsetX > element.clientWidth - 10 ||
          event.offsetY > element.clientHeight - 10)
      ) {
        isResizing = true;
        document.addEventListener("mousemove", resizeElement);
        document.addEventListener("touchmove", resizeElement);
        document.addEventListener("mouseup", stopResizeElement);
        document.addEventListener("touchend", stopResizeElement);
      } else {
        offsetX = event.clientX - element.getBoundingClientRect().left;
        offsetY = event.clientY - element.getBoundingClientRect().top;

        document.addEventListener("mousemove", moveElement);
        document.addEventListener("touchmove", moveElement);
        document.addEventListener("mouseup", stopMovingElement);
        document.addEventListener("touchend", stopMovingElement);
      }
    }

    function moveElement(e) {
      const event = e.type === "touchmove" ? e.touches[0] : e;
      const containerRect = bannerContainer.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();

      let left = event.clientX - offsetX - containerRect.left;
      let top = event.clientY - offsetY - containerRect.top;

      // Prevent the element from being dragged outside the container
      if (left < 0) left = 0;
      if (top < 0) top = 0;
      if (left + elementRect.width > containerRect.width)
        left = containerRect.width - elementRect.width;
      if (top + elementRect.height > containerRect.height)
        top = containerRect.height - elementRect.height;

      element.style.left = `${left}px`;
      element.style.top = `${top}px`;
    }

    function stopMovingElement() {
      document.removeEventListener("mousemove", moveElement);
      document.removeEventListener("touchmove", moveElement);
      document.removeEventListener("mouseup", stopMovingElement);
      document.removeEventListener("touchend", stopMovingElement);
    }

    function resizeElement(e) {
      const event = e.type === "touchmove" ? e.touches[0] : e;
      const containerRect = bannerContainer.getBoundingClientRect();

      let newWidth = event.clientX - element.getBoundingClientRect().left;
      let newHeight = event.clientY - element.getBoundingClientRect().top;

      // Prevent the element from being resized outside the container
      if (
        newWidth + element.getBoundingClientRect().left >
        containerRect.right
      ) {
        newWidth = containerRect.right - element.getBoundingClientRect().left;
      }
      if (
        newHeight + element.getBoundingClientRect().top >
        containerRect.bottom
      ) {
        newHeight = containerRect.bottom - element.getBoundingClientRect().top;
      }

      element.style.width = `${newWidth}px`;
      element.style.height = `${newHeight}px`;
    }

    function stopResizeElement() {
      document.removeEventListener("mousemove", resizeElement);
      document.removeEventListener("touchmove", resizeElement);
      document.removeEventListener("mouseup", stopResizeElement);
      document.removeEventListener("touchend", stopResizeElement);
      isResizing = false;
    }
  }

  document
    .getElementById("downloadBannerImage")
    .addEventListener("click", function () {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      const image = document.getElementById("uploadedBannerImage");
      const container = document.querySelector(".banner-container");
      const containerRect = container.getBoundingClientRect();

      // Set canvas dimensions
      canvas.width = containerRect.width;
      canvas.height = containerRect.height;

      // Draw the image on the canvas
      context.drawImage(image, 0, 0, canvas.width, canvas.height);

      // Draw banners
      const banners = document.querySelectorAll(".banner");
      banners.forEach((banner) => {
        const bannerRect = banner.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const x = bannerRect.left - containerRect.left;
        const y = bannerRect.top - containerRect.top;
        const width = banner.offsetWidth;
        const height = banner.offsetHeight;

        context.drawImage(banner, x, y, width, height);
      });

      // Create a download link and trigger download
      const downloadLink = document.createElement("a");
      downloadLink.href = canvas.toDataURL("image/png");
      downloadLink.download = "banner.png";
      downloadLink.click();
    });

  viewBannerButton.addEventListener("click", () => {
    bannerContainer.classList.toggle("no-resize"); // Toggle visibility of resize dashed borders
    viewBannerButton.textContent =
      viewBannerButton.textContent === "View" ? "Edit" : "View"; // Toggle button text
  });

  undoBannerButton.addEventListener("click", () => {
    if (undoBannerStack.length > 0) {
      const lastElement = undoBannerStack.pop();
      lastElement.remove(); // Remove the last added banner
    }
  });
});
