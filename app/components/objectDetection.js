"use client"; // Enables client-side rendering in Next.js (app directory)

import { load as cocoSSDLoad } from "@tensorflow-models/coco-ssd"; // Loads the COCO-SSD model for object detection
import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam"; // React component for accessing webcam
import * as tf from "@tensorflow/tfjs"; // TensorFlow.js library
import { showPredictions } from "@/utils/showPredictions"; // Utility to draw prediction results on canvas

const ObjectDetection = () => {
  // React state variables
  const [isLoading, setIsLoading] = useState(false); // Loading state for model
  const [email, setEmail] = useState(""); // Email input from user
  const [started, setStarted] = useState(false); // Whether detection has started
  const [emailError, setEmailError] = useState(""); // For validation error messages

  // Refs to access DOM elements
  const webCamRef = useRef(null);
  const canvasRef = useRef(null);

  let detectInterval; // For storing setInterval ID

  // Ensures webcam dimensions are synced correctly
  const showMyVideo = () => {
    if (
      webCamRef.current !== null && // Check if webcam is ready
      webCamRef?.current?.video?.readyState === 4 // Check if video is ready
    ) {
      const myVideoWidth = webCamRef.current.video.videoWidth; // Get video width
      const myVideoHeight = webCamRef.current.video.videoHeight; // Get video height

      webCamRef.current.video.width = myVideoWidth; // Set video width
      webCamRef.current.video.height = myVideoHeight; //  Set video height
    }
  };

  // Loads the COCO-SSD model and starts detection
  const runCoco = async () => {
    setIsLoading(true); // Set loading to true during model load
    const net = await cocoSSDLoad(); // Load the pre-trained COCO-SSD model
    setIsLoading(false);

    // Start detecting objects every 100ms
    detectInterval = setInterval(() => {
      runObjectDetection(net);
    }, 100);
  };

  // Main detection logic
  const runObjectDetection = async (net) => {
    if (
      canvasRef.current && // Check if canvas is ready
      webCamRef.current !== null && // Check if webcam is ready
      webCamRef?.current?.video?.readyState === 4 // Check if video is ready
    ) {
      // Set canvas dimensions equal to video feed
      canvasRef.current.width = webCamRef.current.video.videoWidth; // Set canvas width
      canvasRef.current.height = webCamRef.current.video.videoHeight; // Set canvas height

      // Detect objects from the video feed (threshold 0.3)
      const detectedObjects = await net.detect(webCamRef.current.video, undefined, 0.3);

      // Draw bounding boxes and labels on canvas
      const context = canvasRef.current.getContext("2d"); 
      showPredictions(detectedObjects, context, email, webCamRef);
    }
  };

  // Validates email and starts the surveillance if valid
  const handleStartSurveillance = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Basic regex for email validation
    if (!email) {
      setEmailError("Email is required");
      return;
    }
    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    // No error, start detection
    setEmailError("");
    setStarted(true);
  };

  // Handles side-effects on 'started' change
  useEffect(() => {
    if (started) {
      runCoco(); // Load model and start detection
      showMyVideo(); // Sync video resolution
    }

    // Cleanup interval on component unmount or on new run
    return () => {
      if (detectInterval) {
        clearInterval(detectInterval);
      }
    };
  }, [started]);

  // UI before starting surveillance: input email
  if (!started) {
    return (
      <div className="mt-8 max-w-md mx-auto p-6 bg-transparent rounded-lg shadow-lg">
        <h3 className="text-xl font-semibold mb-4">Enter your Email ID for receiving alerts</h3>
        <div className="mb-4">
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {emailError && <p className="mt-1 text-sm text-red-600">{emailError}</p>}
        </div>
        <button
          onClick={handleStartSurveillance}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition duration-200"
        >
          Start Surveillance
        </button>
      </div>
    );
  }

  // Once surveillance starts, show webcam and canvas
  return (
    <div className="mt-8">
      {isLoading ? (
        <div className="gradient-title">AI Model is Loading ...</div> // Display loading text
      ) : (
        <div className="relative flex justify-center items-center gradient p-1.5 rounded-md">
          <Webcam
            ref={webCamRef}
            className="w-full lg:h-[560px] rounded-md"
            mirrored
            muted
          />
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-full lg:h-[560px] z-99999"
          />
        </div>
      )}
    </div>
  );
};

export default ObjectDetection;



// # Important Notes in One line :
// 1. This code is a React component that uses TensorFlow.js and the COCO-SSD model for real-time object detection using a webcam.
// 2. It includes email validation and allows users to start surveillance by entering their email.
// 3. The component uses the react-webcam library to access the webcam and draw predictions on a canvas overlay.
// 4. The component handles loading states, webcam synchronization, and cleanup of intervals on unmount.
// 5. The showPredictions utility function is used to draw bounding boxes and labels on the canvas based on detected objects.
// 6. The component is designed to be used in a Next.js application with client-side rendering enabled.
// 7. The component is styled using Tailwind CSS classes for a modern and responsive design.
// 8. The component is designed to be user-friendly, providing feedback for loading states and validation errors.
// 9. The component is modular and can be easily integrated into other parts of a Next.js application.
// 10. The component is designed to be reusable and can be customized further based on specific requirements.
// 11. The component uses functional components and React hooks for state management and side effects.
// 12. The component is designed to be efficient, using setInterval for periodic detection and cleanup on unmount.
// 13. The component is designed to be accessible, with proper labeling and error messages for user input.
// 14. The component is designed to be maintainable, with clear separation of concerns and utility functions.
// 15. The component is designed to be scalable, allowing for future enhancements and additional features.
// 16. The component is designed to be performant, using TensorFlow.js for efficient object detection in real-time.
// 17. The component is designed to be secure, with proper validation of user input and handling of sensitive data.
// 18. The component is designed to be cross-browser compatible, using standard web technologies and libraries.
// 19. The component is designed to be responsive, adapting to different screen sizes and orientations.
// 20. The component is designed to be user-friendly, providing a seamless experience for users interacting with the webcam and object detection features.


// # All NPM Commands :
// 1. npm install @tensorflow/tfjs @tensorflow-models/coco-ssd react-webcam
// 2. npm install @tensorflow/tfjs-node @tensorflow/tfjs-node-gpu
// 3. npm install @tensorflow/tfjs-converter
// 4. npm install @tensorflow/tfjs-backend-webgl
// 5. npm install @tensorflow/tfjs-backend-cpu
// 6. npm install @tensorflow/tfjs-backend-wasm
// 7. npm install @tensorflow/tfjs-backend-webgl
// 8. npm install @tensorflow/tfjs-backend-node
// 9. npm install @tensorflow/tfjs-backend-node-gpu
// https://github.com/tensorflow/tfjs-models/tree/master/coco-ssd