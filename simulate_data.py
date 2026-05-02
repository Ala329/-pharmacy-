import json
import random
import time
import requests
from datetime import datetime, timedelta

# Configuration Extraction
CONFIG_PATH = './firebase-applet-config.json'
with open(CONFIG_PATH, 'r') as f:
    config = json.load(f)

API_KEY = config.get('apiKey')
PROJECT_ID = config.get('projectId')
DATABASE_ID = config.get('firestoreDatabaseId', '(default)')

# Firebase REST API endpoints
BASE_URL = f"https://firestore.googleapis.com/v1/projects/{PROJECT_ID}/databases/{DATABASE_ID}/documents"

MEDICINES = [
    {"name": "Amoxicillin 250mg", "id": "AMX-1"},
    {"name": "Insulin Glargine", "id": "INS-G"},
    {"name": "Lipitor 20mg", "id": "LIP-2"},
    {"name": "Metformin 500mg", "id": "MET-5"},
    {"name": "Panadol Extra", "id": "PAN-X"}
]

def generate_tx_hash():
    return "0x" + "".join(random.choices("0123456789abcdef", k=40))

def post_log(batch_id, medicine_name, quantity_change, action_type):
    """Logs an inventory event for AI tracking"""
    payload = {
        "fields": {
            "batchId": {"stringValue": batch_id},
            "medicineName": {"stringValue": medicine_name},
            "quantityChange": {"integerValue": str(quantity_change)},
            "action": {"stringValue": action_type},
            "timestamp": {"timestampValue": datetime.utcnow().isoformat() + "Z"}
        }
    }
    url = f"{BASE_URL}/inventory_logs?key={API_KEY}"
    res = requests.post(url, json=payload)
    return res.status_code

def simulate_event():
    med = random.choice(MEDICINES)
    batch_id = f"SIM-{random.randint(1000, 9999)}"
    
    # Types of events: MINT, TRANSFER, DISPENSE
    event_type = random.choice(["MINT", "TRANSFER", "DISPENSE"])
    
    if event_type == "MINT":
        print(f"DEBUG: Simulating Batch Production: {med['name']} ({batch_id})")
        post_log(batch_id, med['name'], random.randint(50, 200), "PRODUCTION")
    
    elif event_type == "TRANSFER":
        print(f"DEBUG: Simulating Logistics Movement: {med['name']} in transit")
        post_log(batch_id, med['name'], 0, "TRANSFER")
        
    elif event_type == "DISPENSE":
        count = random.randint(1, 15)
        print(f"DEBUG: Simulating Retail Sale: {med['name']} (-{count} units)")
        post_log(batch_id, med['name'], -count, "SALE")

def run_simulation(duration_seconds=300, interval=5):
    print(f"--- PharmaTrust Simulation Engine Started ---")
    print(f"Target Project: {PROJECT_ID}")
    print(f"Running for {duration_seconds}s with {interval}s interval\n")
    
    start_time = time.time()
    try:
        while time.time() - start_time < duration_seconds:
            simulate_event()
            time.sleep(interval)
    except KeyboardInterrupt:
        print("\nSimulation stopped by user.")
    
    print("\n--- Simulation Complete ---")

if __name__ == "__main__":
    # Ensure dependencies are available (requests)
    # Note: In this environment, requests is usually pre-installed in the python runtime
    run_simulation()
