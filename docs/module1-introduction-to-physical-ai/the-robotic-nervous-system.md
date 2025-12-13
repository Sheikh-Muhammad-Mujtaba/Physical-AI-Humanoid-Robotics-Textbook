---
title: The Robotic Nervous System
sidebar_position: 2
---

## The Robotic Nervous System: An Introduction to ROS 2

Just like a biological nervous system, a robot needs a way for its different parts to communicate and work together. This is where the **Robot Operating System (ROS) 2** comes in. It's the middleware that enables robust and scalable robot control.

### Core Concepts

In this module, you will learn the fundamentals of ROS 2, including:

-   **Nodes:** Individual processes that perform a specific task.
-   **Topics:** Named buses over which nodes exchange messages.
-   **Services:** A request/reply model for synchronous communication.
-   **Actions:** For long-running tasks with feedback.

### Bridging AI and Robotics

We will bridge the gap between your Python-based AI agents and ROS 2 controllers using `rclpy`, the Python client library for ROS 2.

```python title="Example: A simple ROS 2 publisher in Python"
import rclpy
from rclpy.node import Node
from std_msgs.msg import String

class HelloWorldPublisher(Node):

    def __init__(self):
        super().__init__('hello_world_publisher')
        self.publisher_ = self.create_publisher(String, 'hello_world', 10)
        timer_period = 0.5  # seconds
        self.timer = self.create_timer(timer_period, self.timer_callback)
        self.i = 0

    def timer_callback(self):
        msg = String()
        msg.data = f'Hello World: {self.i}'
        self.publisher_.publish(msg)
        self.get_logger().info(f'Publishing: "{msg.data}"')
        self.i += 1

def main(args=None):
    rclpy.init(args=args)
    hello_world_publisher = HelloWorldPublisher()
    rclpy.spin(hello_world_publisher)
    hello_world_publisher.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### Describing Your Robot

You will also learn about the **Unified Robot Description Format (URDF)**, an XML format used to describe all elements of a robot, from its links and joints to its sensors and physical properties.

### Weekly Breakdown (Weeks 3-5)

-   **ROS 2 Architecture:** Dive deep into the core concepts and architecture of ROS 2.
-   **Building Packages:** Learn how to build and manage your own ROS 2 packages using Python.
-   **Launch Files:** Master the art of launching complex robotic systems with multiple nodes using launch files.