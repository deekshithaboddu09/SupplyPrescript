
ISL Gesture Data Collection

MediaPipe + OpenCV | Setup guide and working Python code



What this program does
Captures 30-frame sequences for dynamic Indian Sign Language (ISL) gestures. It supports up to two hands, stores 126
values per frame (21 landmarks × 3 coordinates × 2 hands), and records labels and file paths in data/metadata.csv.
1. Install and set up
python -m venv .venv
# Windows:
.venv\Scripts\activate
# Linux/macOS:
source .venv/bin/activate
python -m pip install --upgrade pip
pip install mediapipe opencv-python numpy
2. Save and run the program
Save the complete code below as collect_isl.py. Run it from the project folder with python collect_isl.py. Enter a label
such as HELLO, then press C in the webcam window to record one sequence. Press Q to quit. Repeat each label many
times with natural variation.
3. Data output
data/
■■■ metadata.csv
■■■ HELLO/
■ ■■■ HELLO_00000.npy
■ ■■■ HELLO_00001.npy
■■■ THANK_YOU/
 ■■■ ...
Each saved sample has shape (30, 126) and dtype float32. Missing hands are represented by zero padding. The 30-frame
sequence is a starting point; some signs need longer recordings. For robust recognition, collect varied samples across
different sessions and signers where consent is available. Hand landmarks alone do not represent facial expressions or
body posture, which may be essential for some ISL signs.
4. Complete Python code
The script below checks webcam access, captures only when C is pressed, saves a fixed-length sequence, and closes the
camera cleanly when you press Q.
import cv2
import mediapipe as mp
import numpy as np
import os
import csv
from datetime import datetime
DATA_DIR = "data"
SEQUENCE_LENGTH = 30
MAX_HANDS = 2
FEATURES_PER_FRAME = MAX_HANDS * 21 * 3
os.makedirs(DATA_DIR, exist_ok=True)
mp_hands = mp.solutions.hands
mp_draw = mp.solutions.drawing_utils
def extract_frame_features(results):
 """Return 126 features: 63 per hand, with zero padding."""
 features = np.zeros(FEATURES_PER_FRAME, dtype=np.float32)
 landmarks_by_side = {}
 if not results.multi_hand_landmarks:
 return features
 for i, hand_landmarks in enumerate(results.multi_hand_landmarks):
 side = None
 if results.multi_handedness and i < len(results.multi_handedness):
 side = results.multi_handedness[i].classification[0].label.lower()
 if side in ("left", "right") and side not in landmarks_by_side:
 landmarks_by_side[side] = hand_landmarks
 ordered = []
 for side in ("left", "right"):
 if side in landmarks_by_side:
 ordered.append(landmarks_by_side[side])
 for hand_landmarks in results.multi_hand_landmarks:
 if all(hand_landmarks is not h for h in ordered) and len(ordered) < 2:
 ordered.append(hand_landmarks)
 for hand_index, hand_landmarks in enumerate(ordered[:MAX_HANDS]):
 values = []
 for lm in hand_landmarks.landmark:
 values.extend([lm.x, lm.y, lm.z])
 start = hand_index * 63
 features[start:start + 63] = np.asarray(values, dtype=np.float32)
 return features
def main():
 label = input("Enter ISL word/gesture label (e.g. HELLO): ").strip().upper()
 label = "".join(c for c in label if c.isalnum() or c in "_-")
 if not label:
 print("Invalid label.")
 return
 label_dir = os.path.join(DATA_DIR, label)
 os.makedirs(label_dir, exist_ok=True)
 metadata_path = os.path.join(DATA_DIR, "metadata.csv")
 metadata_exists = os.path.exists(metadata_path)
 sample_count = sum(
 1 for f in os.listdir(label_dir) if f.endswith(".npy")
 )
 cap = cv2.VideoCapture(0)
 if not cap.isOpened():
 print("Cannot open webcam. Check camera permissions or CAMERA_INDEX.")
 return
 recording = False
 sequence = []
 try:
 with mp_hands.Hands(
 static_image_mode=False,
 max_num_hands=MAX_HANDS,
 model_complexity=1,
 min_detection_confidence=0.6,
 min_tracking_confidence=0.6
 ) as hands, open(metadata_path, "a", newline="", encoding="utf-8") as f:
 writer = csv.writer(f)
 if not metadata_exists:
 writer.writerow([
 "label", "filename", "frames",
 "features_per_frame", "timestamp"
 ])
 while True:
 ok, frame = cap.read() ISL Gesture Data Collection Guide Page 3
 if not ok:
 print("Could not read from webcam.")
 break
 frame = cv2.flip(frame, 1)
 rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
 rgb.flags.writeable = False
 results = hands.process(rgb)
 rgb.flags.writeable = True
 if results.multi_hand_landmarks:
 for hand_landmarks in results.multi_hand_landmarks:
 mp_draw.draw_landmarks(
 frame, hand_landmarks, mp_hands.HAND_CONNECTIONS
 )
 if recording:
 sequence.append(extract_frame_features(results))
 cv2.putText(
 frame, f"RECORDING {len(sequence)}/{SEQUENCE_LENGTH}",
 (10, 35), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 2
 )
 if len(sequence) >= SEQUENCE_LENGTH:
 arr = np.stack(sequence).astype(np.float32)
 filename = f"{label}_{sample_count:05d}.npy"
 filepath = os.path.join(label_dir, filename)
 np.save(filepath, arr)
 writer.writerow([
 label, filepath, SEQUENCE_LENGTH,
 FEATURES_PER_FRAME,
 datetime.now().isoformat(timespec="seconds")
 ])
 f.flush()
 sample_count += 1
 print(f"Saved {filepath}, shape={arr.shape}")
 sequence = []
 recording = False
 else:
 cv2.putText(
 frame, f"Label: {label} | Saved: {sample_count}",
 (10, 35), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2
 )
 cv2.putText(
 frame, "C: capture sequence | Q: quit",
 (10, 70), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2
 )
 cv2.imshow("ISL Data Collection", frame)
 key = cv2.waitKey(1) & 0xFF
 if key == ord("q"):
 break
 if key == ord("c") and not recording:
 recording = True
 sequence = []
 print(f"Recording {label}: perform the complete sign now.")
 finally:
 cap.release()
 cv2.destroyAllWindows()
 print(f"Finished. Samples saved for {label}: {sample_count}")
if __name__ == "__main__":
 main()




