from studio.lipsync import cues_to_frames, frame_render_key


def test_cues_hold_on_twos():
    cues = [
        {"start": 0.0, "end": 0.12, "value": "A"},
        {"start": 0.12, "end": 0.3, "value": "B"},
    ]
    frames = cues_to_frames(cues, fps=24, n_frames=8, shoot_on=2)
    assert len(frames) == 8
    assert frames[0] == frames[1]
    assert frames[0] == "A"


def test_sequence_boundary():
    seq = ["mouth_a.png", "mouth_a.png", "mouth_b.png", "mouth_b.png", "mouth_b.png", "mouth_b.png"]
    first = frame_render_key(1, 2, [seq])
    second = frame_render_key(2, 2, [seq])
    third = frame_render_key(3, 2, [seq])
    assert first == second
    assert first != third
