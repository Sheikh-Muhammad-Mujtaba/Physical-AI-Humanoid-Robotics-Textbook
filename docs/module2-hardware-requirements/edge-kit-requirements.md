---
title: Edge Kit Requirements
sidebar_position: 2
---

## The "Physical AI" Edge Kit

Since a full humanoid robot is a significant investment, we will learn the principles of "Physical AI" by setting up a robotic "nervous system" on a desk before deploying it to a robot. This kit is essential for **Module 3 (Isaac ROS)** and **Module 4 (VLA)**.

### The Brain: NVIDIA Jetson

-   **Required:** NVIDIA Jetson Orin Nano (8GB) or Orin NX (16GB).
-   **Role:** This is the industry standard for embodied AI. You will deploy your ROS 2 nodes here to understand the resource constraints of an edge device compared to your powerful workstation.

### The Eyes: Intel RealSense

-   **Required:** Intel RealSense D435i or D455.
-   **Role:** This camera provides both RGB (color) and depth (distance) data, which is essential for the VSLAM (Visual Simultaneous Localization and Mapping) and Perception modules.

### The Inner Ear: IMU

-   **Required:** A generic USB IMU (BNO055).
-   **Note:** While many cameras and Jetson boards have a built-in IMU, using a separate module will teach you the important process of IMU calibration.

### Voice Interface

-   **Required:** A simple USB microphone/speaker array (e.g., ReSpeaker).
-   **Role:** This will be used for the "Voice-to-Action" integration with OpenAI Whisper in Module 4.