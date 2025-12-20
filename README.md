# BlossomScape

BlossomScape is an interactive, shader-based generative flower garden
![Generated Flowers](Screenshot%202025-12-20%20at%202.40.59%20AM.png) 
---

## Description

BlossomScape explores procedural graphics using WebGL and Three.js. Flowers are generated entirely in a fragment shader using mathematical functions rather than image textures or pre-made models.

User interaction drives the experience: each click places a flower at the clicked location. A fake depth illusion is created by scaling screen-space coordinates, making some flowers appear closer and others farther away. Feedback rendering is used so that flowers accumulate rather than disappearing each frame.

The visual style is inspired by immersive digital art installations and focuses on calm motion, color variation, and layered composition.

---

## Visuals

### Initial Scene

![Initial Scene](Screenshot%202025-12-20%20at%202.39.56%20AM.png)

This image shows the initial state of the project before interaction, with a dark background and subtle atmospheric particles.

---

### Generated Flowers

![Generated Flowers](Screenshot%202025-12-20%20at%202.40.59%20AM.png)

This image shows multiple procedurally generated flowers after user interaction. Each flower has a unique size, color variation, and growth pattern.

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
