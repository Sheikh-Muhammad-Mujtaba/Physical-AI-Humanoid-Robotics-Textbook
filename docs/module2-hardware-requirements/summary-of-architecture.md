---
title: Summary of Architecture
sidebar_position: 4
---

## Summary of Lab Architecture

To teach this course successfully, your lab infrastructure should include the following components:

| Component | Hardware | Function |
| :--- | :--- | :--- |
| **Sim Rig** | PC with RTX 4080 + Ubuntu 22.04 | Runs Isaac Sim, Gazebo, Unity, and trains LLM/VLA models. |
| **Edge Brain** | Jetson Orin Nano | Runs the "Inference" stack. Students deploy their code here. |
| **Sensors** | RealSense Camera + Lidar | Connected to the Jetson to feed real-world data to the AI. |
| **Actuator** | Unitree Go2 or G1 (Shared) | Receives motor commands from the Jetson. |