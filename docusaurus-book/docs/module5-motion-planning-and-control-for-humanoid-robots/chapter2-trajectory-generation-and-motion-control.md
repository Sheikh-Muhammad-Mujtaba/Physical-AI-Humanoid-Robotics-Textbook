---
title: "Chapter 2: Trajectory Generation and Motion Control"
---

# Chapter 2: Trajectory Generation and Motion Control

## Guiding the Robot: From Path to Precise Movement

Once a robot perceives its environment and a high-level plan is formulated, the next crucial step is to translate that plan into actual physical motion. This involves **trajectory generation**, which defines the specific path and timing of a robot's movement, and **motion control**, which ensures the robot accurately follows that trajectory. For complex systems like humanoid robots, these tasks are particularly challenging due to their many degrees of freedom and dynamic interactions with the environment.

### 1. Trajectory Generation: Defining the How and When

Trajectory generation is the process of computing a time-parameterized path for a robot's joints or end-effectors. It converts a desired sequence of positions (a *path*) into a sequence of positions, velocities, and accelerations over time (a *trajectory*). Good trajectories are smooth, efficient, and avoid dynamic constraints.

#### Key Aspects of Trajectory Generation:

*   **Path Planning vs. Trajectory Generation**:
    *   **Path Planning**: Determines a collision-free geometric path from a start to a goal configuration (e.g., using algorithms like RRT*, PRM, A*).
    *   **Trajectory Generation**: Adds the time component to the planned path, specifying *how fast* and *when* the robot should be at each point.
*   **Joint Space vs. Task Space Trajectories**:
    *   **Joint Space**: Trajectories defined as a sequence of joint angles over time. Simpler to compute but might result in unexpected end-effector paths.
    *   **Task Space (Cartesian Space)**: Trajectories defined as a sequence of end-effector positions and orientations over time. More intuitive for human users but requires inverse kinematics to convert to joint angles.
*   **Smoothness and Continuity**: Desirable trajectories are smooth (continuous position, velocity, and acceleration) to minimize jerk, reduce wear on actuators, and ensure stable control. Common methods use polynomial interpolation (e.g., cubic, quintic polynomials) or splines.
*   **Dynamic Constraints**: Trajectories must respect the robot's physical limits, such as maximum joint velocities, accelerations, and torque capabilities.

### 2. Motion Control: Following the Trajectory

Motion control is the mechanism by which a robot's actuators are commanded to track a generated trajectory as accurately as possible, despite disturbances and uncertainties. It's the "muscle memory" that ensures the robot executes the desired movements.

#### Fundamental Control Architectures:

*   **Open-Loop Control**: Commands are sent to actuators without feedback from sensors. Simple but highly susceptible to errors and disturbances. (Rarely used in complex robotics).
*   **Closed-Loop Control (Feedback Control)**: Uses sensor feedback to continuously compare the robot's actual state with the desired state and adjust commands accordingly. This is the cornerstone of robust robot control.

#### Common Control Strategies:

1.  **PID Control (Proportional-Integral-Derivative)**:
    *   **Concept**: A widely used, robust, and relatively simple feedback control loop mechanism. It calculates an "error" value as the difference between a desired setpoint and a measured process variable. The controller attempts to minimize the error by adjusting the process control inputs.
    *   **P (Proportional)**: Adjusts output proportional to the current error.
    *   **I (Integral)**: Accounts for past errors, helping eliminate steady-state errors.
    *   **D (Derivative)**: Predicts future errors based on the rate of change of error, helping dampen oscillations.
    *   **Application**: Controlling individual joint positions, velocities, or torques.
2.  **Computed Torque Control**:
    *   **Concept**: A model-based control strategy that uses the robot's inverse dynamics model to calculate the joint torques required to achieve a desired acceleration. It effectively linearizes and decouples the robot's dynamics.
    *   **Application**: Achieving precise trajectory tracking for robots with well-known dynamic models.
3.  **Impedance Control**:
    *   **Concept**: Instead of directly controlling position or force, impedance control seeks to regulate the relationship between position and force (i.e., the robot's "mechanical impedance" or stiffness/damping).
    *   **Application**: Enabling robots to interact compliantly and safely with the environment or humans, e.g., in collaborative robotics or assembly tasks.
4.  **Admittance Control**:
    *   **Concept**: The dual of impedance control, where the robot's motion is controlled based on external forces applied to it.
    *   **Application**: Human-robot collaboration, allowing humans to guide the robot's movement.

### From Simulation to Reality: The Importance of Robustness

Generating perfect trajectories and designing sophisticated controllers in simulation is one thing; making them work reliably on a physical humanoid robot is another. Real-world challenges like sensor noise, actuator limits, unmodeled dynamics, and external disturbances necessitate robust control strategies and careful tuning. Bridging this "sim-to-real" gap often involves domain randomization, system identification, and adaptive control techniques to ensure that the robot's planned movements can be executed with precision and stability in its complex physical environment.