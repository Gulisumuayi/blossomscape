# BlossomScape

BlossomScape is an interactive, shader-based generative flower garden
<img width="1598" height="844" alt="generated-flowers" src="https://github.com/user-attachments/assets/d9b9ef02-0fe4-46bd-a6b6-2854cf5f87ea" />


---

## Description

BlossomScape explores procedural graphics using WebGL and Three.js. Flowers are generated entirely in a fragment shader using mathematical functions rather than image textures or pre-made models.

User interaction drives the experience: each click places a flower at the clicked location. A fake depth illusion is created by scaling screen-space coordinates, making some flowers appear closer and others farther away. Feedback rendering is used so that flowers accumulate rather than disappearing each frame.

The visual style is inspired by immersive digital art installations and focuses on calm motion, color variation, and layered composition.

---

## Visuals
<img width="754" height="541" alt="initial-scene" src="https://github.com/user-attachments/assets/4cd9516e-3175-4201-86bd-8d5413af5082" />
<img width="754" height="541" alt="initial-scene" src="https://github.com/user-attachments/assets/ea1c4ead-112b-4c34-9a04-60e91218e384" />


---

## Technologies Used

This project was developed using the following technologies and tools:

- JavaScript for application logic and interaction handling
- Three.js as a WebGL abstraction layer
- WebGL for GPU-accelerated rendering
- GLSL for custom fragment and vertex shader programming
- HTML for structure
- CSS for layout and styling
---

## Link
https://gulisumuayi.github.io/blossomscape/ 
---

## Usage

- Click anywhere on the screen to add a flower.
- Each click creates a new flower with procedural variation.
- Flowers grow over time and remain on the screen.
- The scene builds gradually through repeated interaction.
- The “clean the screen” button resets the canvas.
---
## Future Improvements 
One potential future improvement for this project would be to extend the current screen-space implementation into a true three-dimensional environment. While the current version uses a fake depth illusion to vary the apparent size of flowers, a 3D implementation could allow flowers to exist at different positions in 3D space, with a movable camera and perspective-based depth.

Additional improvements could include adding subtle environmental motion, such as wind affecting stems, or allowing users to navigate through the scene rather than interacting from a fixed viewpoint. More variation in flower shapes and growth patterns could also be explored to further enhance visual diversity.

These extensions were not implemented in the current version due to time constraints, but the project was designed in a way that would allow future expansion into a fully three-dimensional scene.
---
## Acknowledgments

Thanks to Professor Daniel Haehn and the CS460 course teaching assistants for their guidance throughout the semester. Their lectures, examples, and feedback helped shape my understanding of computer graphics concepts such as shader programming, procedural generation, and interactive visual systems.

This project was developed as part of the CS460 curriculum and reflects techniques and ideas explored in class, including fragment shaders, screen-space manipulation, and real-time interaction. The course structure and assignments provided a strong foundation for experimenting with creative graphics programming and translating technical concepts into a cohesive visual experience.

Additional inspiration came from contemporary immersive digital art installations and online WebGL learning resources that encouraged exploration beyond basic examples while maintaining a focus on clarity and intentional design.
