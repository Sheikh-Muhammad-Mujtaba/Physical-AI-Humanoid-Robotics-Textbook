---
id: the-latency-trap
title: The Latency Trap (Hidden Cost)
sidebar_position: 3
---

## The Latency Trap: A Hidden Cost of Cloud Robotics

Simulating in the cloud works well for training and testing, but controlling a real robot from a cloud instance is **dangerous** due to network latency. The delay between sending a command and the robot executing it can lead to unpredictable and unsafe behavior.

### The Solution: Train in the Cloud, Deploy on the Edge

The solution to the latency trap is a "train in the cloud, deploy on the edge" workflow:

1.  **Train in the Cloud:** Use the power of cloud workstations to train your AI models.
2.  **Download the Model:** Once your model is trained, download the model weights to your local machine.
3.  **Flash to the Edge:** Flash the trained model to your local Jetson kit for real-world deployment.

This approach combines the best of both worlds: the power of the cloud for training and the low-latency responsiveness of an edge device for real-time control.