def cues_to_frames(cues, fps, n_frames, shoot_on=2, offset_frames=0):
    frames = ["X"] * n_frames
    for cue in cues:
        start = int(round(cue["start"] * fps)) + offset_frames
        end = max(int(round(cue["end"] * fps)) + offset_frames, start + 1)
        for index in range(max(start, 0), min(end, n_frames)):
            frames[index] = cue["value"]
    if shoot_on > 1:
        frames = [frames[(index // shoot_on) * shoot_on] for index in range(n_frames)]
    return frames


def frame_render_key(frame: int, shoot_on: int, sequences: list) -> tuple:
    held = ((frame - 1) // max(1, shoot_on)) * max(1, shoot_on) + 1
    picks = tuple(seq[frame - 1] for seq in sequences)
    return (held, picks)
