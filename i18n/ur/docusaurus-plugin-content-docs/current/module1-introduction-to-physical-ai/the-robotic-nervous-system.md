---
title: The Robotic Nervous System
sidebar_position: 2
---

## روبوٹک اعصابی نظام: ROS 2 کا تعارف

جس طرح ایک حیاتیاتی اعصابی نظام کام کرتا ہے، اسی طرح ایک روبوٹ کو بھی اپنے مختلف حصوں کے آپس میں بات چیت کرنے اور مل کر کام کرنے کے لیے ایک طریقے کی ضرورت ہوتی ہے۔ یہاں **Robot Operating System (ROS) 2** کا کردار سامنے آتا ہے۔ یہ ایک مڈل ویئر ہے جو مضبوط اور قابل توسیع روبوٹ کنٹرول کو ممکن بناتا ہے۔

### بنیادی تصورات

اس ماڈیول میں، آپ ROS 2 کے بنیادی اصولوں کو سیکھیں گے، جن میں شامل ہیں:

-   **نوڈز (Nodes):** انفرادی پراسیسز جو ایک مخصوص کام انجام دیتے ہیں۔
-   **ٹاپکس (Topics):** نامزد بسیں جن کے ذریعے نوڈز پیغامات کا تبادلہ کرتے ہیں۔
-   **سروسز (Services):** ہم وقت مواصلت (synchronous communication) کے لیے ایک درخواست/جواب کا ماڈل۔
-   **ایکشنز (Actions):** فیڈ بیک کے ساتھ طویل المدتی کاموں کے لیے۔

### AI اور روبوٹکس کے درمیان پل

ہم آپ کے Python پر مبنی AI ایجنٹس اور ROS 2 کنٹرولرز کے درمیان موجود فرق کو `rclpy` کا استعمال کرتے ہوئے پر کریں گے، جو ROS 2 کے لیے Python کلائنٹ لائبریری ہے۔

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

### اپنے روبوٹ کی وضاحت کرنا

آپ **Unified Robot Description Format (URDF)** کے بارے میں بھی جانیں گے، ایک XML فارمیٹ جو ایک روبوٹ کے تمام عناصر کی وضاحت کے لیے استعمال ہوتا ہے، اس کے لنکس اور جوڑ سے لے کر اس کے سینسرز اور طبعی خصوصیات تک۔

### ہفتہ وار تفصیل (ہفتے 3-5)

-   **ROS 2 آرکیٹیکچر:** ROS 2 کے بنیادی تصورات اور آرکیٹیکچر میں گہرائی سے جائیں۔
-   **پیکجز بنانا:** سیکھیں کہ Python کا استعمال کرتے ہوئے اپنے ROS 2 پیکجز کو کیسے بنایا اور منظم کیا جائے۔
-   **لانچ فائلز (Launch Files):** لانچ فائلز کا استعمال کرتے ہوئے متعدد نوڈز کے ساتھ پیچیدہ روبوٹک سسٹمز کو لانچ کرنے کے فن میں مہارت حاصل کریں۔