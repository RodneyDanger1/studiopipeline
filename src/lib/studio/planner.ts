import { DEEPSEEK, type Episode } from "./model";

/** Original house draft so the desk is watchable before a key is saved.
 *  Not a model response. Replaced the moment DeepSeek writes an episode.
 *  Frame sum is 192 at 24 fps = 8.00s, inside the 3% check.
 */
export function houseDraft(): Episode {
  return {
    title: "The Last Lantern",
    logline:
      "Lantern keeper Mira carries the last steady light down a pine ridge as the valley goes dark.",
    source: "house-draft",
    model: DEEPSEEK.version,
    fps: 24,
    target_seconds: 8,
    beats: [
      { title: "Ridge", seconds: 4, summary: "The valley lights fail, one by one." },
      { title: "Decision", seconds: 2, summary: "Mira names what she sees." },
      { title: "Walk", seconds: 2, summary: "She starts down with the lantern." },
    ],
    shots: [
      {
        shot_id: "EP01_S001",
        episode: 1,
        lane: "blender_2p5d",
        fps: 24,
        resolution: [1280, 720],
        duration_frames: 96,
        shoot_on: 2,
        camera: { move: "dolly_in", start_z: 10.5, end_z: 8.2, ease: "ease_in_out" },
        layers: [
          { name: "sky", image: "assets/sky.png", depth: 40 },
          { name: "hills", image: "assets/hills.png", depth: 25 },
          { name: "hero", image: "assets/hero.png", depth: 12 },
          { name: "lantern", image: "assets/lantern.png", depth: 11 },
        ],
        fx: ["film_grain", "vignette"],
        dialogue: [],
        notes: "Establishing. Painted plates, xerox cel, lights dying on twos.",
      },
      {
        shot_id: "EP01_S002",
        episode: 1,
        lane: "blender_2p5d",
        fps: 24,
        resolution: [1280, 720],
        duration_frames: 48,
        shoot_on: 2,
        camera: { move: "hold", start_z: 8.2, end_z: 7.6, ease: "ease_out" },
        layers: [
          { name: "sky", image: "assets/sky.png", depth: 36 },
          { name: "hills", image: "assets/hills.png", depth: 22 },
          { name: "hero", image: "assets/hero.png", depth: 9 },
          { name: "lantern", image: "assets/lantern.png", depth: 8 },
        ],
        fx: ["film_grain", "vignette"],
        dialogue: [{ character: "Mira", text: "The valley is going dark.", start_frame: 8 }],
        notes: "Closer. Dialogue fits the hold.",
      },
      {
        shot_id: "EP01_S003",
        episode: 1,
        lane: "blender_2p5d",
        fps: 24,
        resolution: [1280, 720],
        duration_frames: 48,
        shoot_on: 2,
        camera: { move: "dolly_in", start_z: 7.6, end_z: 6.4, ease: "ease_in" },
        layers: [
          { name: "sky", image: "assets/sky.png", depth: 30 },
          { name: "hills", image: "assets/hills.png", depth: 18 },
          { name: "hero", image: "assets/hero.png", depth: 7 },
          { name: "lantern", image: "assets/lantern.png", depth: 6 },
        ],
        fx: ["vignette"],
        dialogue: [{ character: "Mira", text: "Then we walk.", start_frame: 6 }],
        notes: "Button. She steps toward the valley.",
      },
    ],
  };
}
