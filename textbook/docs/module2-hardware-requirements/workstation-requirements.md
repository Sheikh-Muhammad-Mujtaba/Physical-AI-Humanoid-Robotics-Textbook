---
id: workstation-requirements
title: Workstation Requirements
sidebar_position: 1
---

## The Demands of Physical AI

This course is technically demanding, sitting at the intersection of three heavy computational loads:

-   **Physics Simulation (Isaac Sim/Gazebo):** Simulating the real world is computationally expensive.
-   **Visual Perception (SLAM/Computer Vision):** Enabling robots to see and understand their environment requires significant processing power.
-   **Generative AI (LLMs/VLA):** Running large language and vision-language-action models is resource-intensive.

Because our capstone project involves a "Simulated Humanoid," the primary investment must be in **High-Performance Workstations**. However, to truly fulfill the promise of "Physical AI," you will also need Edge Computing Kits and potentially specific robot hardware.

## The "Digital Twin" Workstation (Required per Student)

This is the most critical component of your setup. **NVIDIA Isaac Sim**, an Omniverse application, is at the heart of our simulation work, and it requires a GPU with **RTX (Ray Tracing)** capabilities.

:::danger Important
Standard laptops, including MacBooks and non-RTX Windows machines, will **not** be sufficient for this course.
:::

### GPU (The Bottleneck)

-   **Required:** NVIDIA RTX 4070 Ti (12GB VRAM) or higher.
-   **Why:** You need high VRAM to load the USD (Universal Scene Description) assets for the robot and environment, and to run the VLA (Vision-Language-Action) models simultaneously.
-   **Ideal:** An RTX 3090 or 4090 with 24GB of VRAM will provide a smoother "Sim-to-Real" training experience.

### CPU

-   **Required:** Intel Core i7 (13th Gen+) or AMD Ryzen 9.
-   **Why:** Physics calculations (Rigid Body Dynamics) in Gazebo and Isaac Sim are CPU-intensive.

### RAM

-   **Required:** 64 GB DDR5.
-   **Minimum:** 32 GB is the absolute minimum, but you will likely experience crashes during complex scene rendering.

### Operating System

-   **Required:** Ubuntu 22.04 LTS.
-   **Note:** While Isaac Sim can run on Windows, ROS 2 (Humble/Iron) is native to Linux. A dual-boot setup or a dedicated Linux machine is **mandatory** for a friction-free experience.