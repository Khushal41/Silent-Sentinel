import {throttle} from "lodash";

// throttled version of the email notification system to prevent spam
const sendEmailNotification = throttle(async (email, screenshot) => {
  try {
    const response = await fetch('/api/notify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Person detected in your house!',
        email: email,
        screenshot: screenshot
      }),
    });
    
    if (!response.ok) {
      console.error('Failed to send notification');
    }
  } catch (error) {
    console.error('Error sending notification:', error);
  }
}, 120000); // Only allow one email per 2 minutes

export const showPredictions = (predictions, ctx, email, webcamRef) => {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  // Save the current context state
  ctx.save();
  
  // Mirror the context horizontally
  ctx.scale(-1, 1);
  ctx.translate(-ctx.canvas.width, 0);

  // Fonts
  const font = "16px sans-serif";
  ctx.font = font;
  ctx.textBaseline = "top";

  let personDetected = false;

  predictions.forEach((prediction) => {
    const [x, y, width, height] = prediction["bbox"];

    const isPerson = prediction.class === "person"; // Check if the detected object is a person

    // Check if a person is detected
    if (isPerson) {
      personDetected = true;
    }

    // bounding box
    ctx.strokeStyle = isPerson ? "#FF0000" : "#00FFFF";
    ctx.lineWidth = 4;
    ctx.strokeRect(x, y, width, height);

    // fill the color
    ctx.fillStyle = `rgba(255, 0, 0, ${isPerson ? 0.2 : 0})`; // Set the fill color to red
    ctx.fillRect(x, y, width, height);

    // Draw the label background.
    ctx.fillStyle = isPerson ? "#FF0000" : "#00FFFF";
    const textWidth = ctx.measureText(prediction.class).width;
    const textHeight = parseInt(font, 10); // base 10
    ctx.fillRect(x, y, textWidth + 4, textHeight + 4);

    // For text, we need to flip it back so it's readable
    ctx.scale(-1, 1);
    ctx.translate(-x * 2 - textWidth - 4, 0);
    ctx.fillStyle = "#000000";
    ctx.fillText(prediction.class, x, y);
    ctx.translate(x * 2 + textWidth + 4, 0);
    ctx.scale(-1, 1);
  });

  // If a person is detected, send email notification with screenshot
  if (personDetected && email && webcamRef) {
    // Capture screenshot from webcam
    const screenshot = webcamRef.current.getScreenshot();
    // Send email with screenshot
    sendEmailNotification(email, screenshot);
  }

  // Restore the context state
  ctx.restore();
};