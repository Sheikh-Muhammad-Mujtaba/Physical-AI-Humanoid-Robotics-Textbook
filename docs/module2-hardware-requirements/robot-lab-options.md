---
title: Robot Lab Options
sidebar_position: 3
---

## The Robot Lab: Putting the "Physical" in Physical AI

For the "Physical" part of the course, you have three tiers of options depending on your budget.

### Option A: The "Proxy" Approach (Recommended for Budget)

Use a quadruped (dog-like robot) or a robotic arm as a proxy for a humanoid. The software principles (ROS 2, VSLAM, Isaac Sim) transfer with about 90% effectiveness to humanoids.

-   **Robot:** Unitree Go2 Edu (~$1,800 - $3,000).
-   **Pros:** Highly durable, excellent ROS 2 support, and affordable enough to have multiple units.
-   **Cons:** Not a biped (humanoid), so you won't be able to explore bipedal locomotion.

### Option B: The "Miniature Humanoid" Approach

These are small, table-top humanoids that provide a more authentic humanoid experience.

-   **Robot:**
    -   Unitree G1 (~$16k) or Robotis OP3 (older, but stable, ~$12k). The Unitree H1 is too expensive at $90k+.
    -   **Budget Alternative:** Hiwonder TonyPi Pro (~$600).
-   **Warning:** The cheaper kits (like the Hiwonder) usually run on a Raspberry Pi, which cannot run NVIDIA Isaac ROS efficiently. You would use these primarily for kinematics (walking) and use the Jetson kits for the AI components.

### Option C: The "Premium" Lab (Sim-to-Real Specific)

If your goal is to deploy the capstone project to a real humanoid robot, this is the option for you.

-   **Robot:** Unitree G1 Humanoid.
-   **Why:** It is one of the few commercially available humanoids that can walk dynamically and has an SDK that is open enough for you to inject your own ROS 2 controllers.