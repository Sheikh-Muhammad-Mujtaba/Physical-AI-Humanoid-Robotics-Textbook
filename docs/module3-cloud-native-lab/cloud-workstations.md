---
title: Cloud Workstations
sidebar_position: 1
---

## The Cloud-Native Lab: An Alternative to Physical Hardware

If you do not have access to RTX-enabled workstations, a cloud-native lab is a viable alternative. This approach relies on cloud-based instances (like AWS RoboMaker or NVIDIA's cloud delivery for Omniverse) and is ideal for rapid deployment or if you have a less powerful laptop.

:::info
Building a "Physical AI" lab is a significant investment. You will have to choose between building a physical **On-Premise Lab** (High Capital Expenditure) versus running a **Cloud-Native Lab** (High Operating Expenditure).
:::

### The "Ether" Lab (Cloud-Native)

This option is best for:
-   Rapid deployment
-   Students with weaker laptops

#### 1. Cloud Workstations (AWS/Azure)

Instead of buying powerful PCs, you can rent cloud instances.

-   **Instance Type:** AWS g5.2xlarge (A10G GPU, 24GB VRAM) or g6e.xlarge.
-   **Software:** NVIDIA Isaac Sim on Omniverse Cloud (requires a specific Amazon Machine Image - AMI).

#### Cost Calculation

-   **Instance Cost:** ~$1.50/hour (using a mix of spot and on-demand instances).
-   **Usage:** 10 hours/week × 12 weeks = 120 hours.
-   **Storage:** ~$25/quarter (for EBS volumes to save your environments).
-   **Total Cloud Bill:** ~$205 per quarter.