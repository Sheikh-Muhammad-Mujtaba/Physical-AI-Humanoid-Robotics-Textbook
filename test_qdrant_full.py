#!/usr/bin/env python3
"""
Comprehensive Qdrant Collection Testing Script
Tests Qdrant connection, collection configuration, and performs vector searches
to verify everything is working correctly.
"""

import os
import requests
import json
from datetime import datetime

# Load environment variables
env_vars = {}
env_file = "api/.env"
if os.path.exists(env_file):
    with open(env_file) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, value = line.split("=", 1)
                env_vars[key.strip()] = value.strip().strip('"\'')

QDRANT_URL = env_vars.get("QDRANT_URL", "").rstrip("/")
QDRANT_API_KEY = env_vars.get("QDRANT_API_KEY")
COLLECTION_NAME = env_vars.get("QDRANT_COLLECTION_NAME", "textbook_chunks")

if not QDRANT_URL or not QDRANT_API_KEY:
    print("❌ ERROR: Missing QDRANT_URL or QDRANT_API_KEY in .env")
    exit(1)

headers = {
    "api-key": QDRANT_API_KEY,
    "Content-Type": "application/json"
}

print("=" * 100)
print(f"QDRANT COMPREHENSIVE TEST - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
print("=" * 100)
print(f"\nConfiguration:")
print(f"  URL: {QDRANT_URL}")
print(f"  Collection: {COLLECTION_NAME}")
print()

# ============================================================================
# TEST 1: Connection & Collection Info
# ============================================================================
print("TEST 1: Collection Information")
print("-" * 100)

try:
    response = requests.get(
        f"{QDRANT_URL}/collections/{COLLECTION_NAME}",
        headers=headers,
        timeout=10
    )

    if response.status_code == 200:
        data = response.json()
        result = data.get("result", {})

        print(f"✅ Collection found")
        print(f"  Status: {result.get('status', 'N/A')}")
        print(f"  Points count: {result.get('points_count', 'N/A')}")
        print(f"  Segments count: {result.get('segments_count', 'N/A')}")
        print(f"  Indexed vectors: {result.get('indexed_vectors_count', 'N/A')}")

        # Check vector configuration
        config = result.get('config', {})
        params = config.get('params', {})
        vectors = params.get('vectors', {})

        print(f"\n  Vector Configuration:")
        if isinstance(vectors, dict):
            if 'size' in vectors and 'distance' in vectors:
                print(f"    Size: {vectors.get('size')} dimensions")
                print(f"    Distance: {vectors.get('distance')}")
            else:
                print(f"    {json.dumps(vectors, indent=6)}")
        else:
            print(f"    Single vector: {vectors}")

        points_count = result.get('points_count', 0)
        if points_count == 0:
            print(f"\n⚠️  WARNING: Collection is empty (0 points)")
            print(f"    The textbook data needs to be loaded into Qdrant")
        else:
            print(f"\n✅ Collection has data: {points_count} points")

    else:
        print(f"❌ ERROR: Status {response.status_code}")
        print(f"  Response: {response.text[:200]}")

except Exception as e:
    print(f"❌ ERROR: {str(e)}")

# ============================================================================
# TEST 2: Test Vector Query (with 768-dim vector)
# ============================================================================
print("\n\nTEST 2: Vector Search Query (768-dim)")
print("-" * 100)

try:
    # Create a 768-dimensional test vector
    test_vector = [0.1] * 768

    response = requests.post(
        f"{QDRANT_URL}/collections/{COLLECTION_NAME}/points/query",
        headers=headers,
        json={
            "query": test_vector,
            "limit": 5
        },
        timeout=10
    )

    if response.status_code == 200:
        data = response.json()
        points = data.get("result", {}).get("points", [])

        print(f"✅ Query successful (HTTP 200)")
        print(f"  Results count: {len(points)}")

        if len(points) > 0:
            print(f"\n  Top 3 results:")
            for i, point in enumerate(points[:3], 1):
                print(f"    {i}. ID: {point.get('id')}, Score: {point.get('score', 'N/A'):.4f}")
                payload = point.get('payload', {})
                text_preview = payload.get('text', '')[:60]
                print(f"       Text: {text_preview}...")
                print(f"       Source: {payload.get('source', 'N/A')}")
        else:
            print(f"  No results returned (collection might be empty)")

    elif response.status_code == 400:
        print(f"❌ ERROR: HTTP 400 Bad Request")
        error_msg = response.json().get('status', {}).get('error', response.text[:200])
        print(f"  Error: {error_msg}")
        if "dimension" in error_msg.lower():
            print(f"\n  ⚠️  DIMENSION MISMATCH!")
            print(f"     Check if collection expects different vector dimensions")
        if "not found" in error_msg.lower():
            print(f"\n  ⚠️  VECTOR NOT FOUND!")
            print(f"     The named vector might not exist in collection")

    else:
        print(f"❌ ERROR: HTTP {response.status_code}")
        print(f"  Response: {response.text[:300]}")

except Exception as e:
    print(f"❌ ERROR: {str(e)}")

# ============================================================================
# TEST 3: Test with Named Vectors (if collection uses them)
# ============================================================================
print("\n\nTEST 3: Named Vector Search (if applicable)")
print("-" * 100)

vector_names_to_try = ["text", "embedding", "vector", "default"]
test_vector = [0.1] * 768

for vector_name in vector_names_to_try:
    try:
        if vector_name == "default":
            # Skip named vector parameter for default
            continue

        response = requests.post(
            f"{QDRANT_URL}/collections/{COLLECTION_NAME}/points/query",
            headers=headers,
            json={
                "query": test_vector,
                "using": vector_name,
                "limit": 1
            },
            timeout=10
        )

        if response.status_code == 200:
            points = response.json().get("result", {}).get("points", [])
            print(f"✅ Named vector '{vector_name}': Works! ({len(points)} results)")
        else:
            error = response.json().get('status', {}).get('error', 'Unknown error')
            print(f"❌ Named vector '{vector_name}': {error[:60]}")

    except Exception as e:
        print(f"❌ Named vector '{vector_name}': Connection error")

# ============================================================================
# TEST 4: Detailed Point Analysis
# ============================================================================
print("\n\nTEST 4: Collection Points Analysis")
print("-" * 100)

try:
    response = requests.get(
        f"{QDRANT_URL}/collections/{COLLECTION_NAME}",
        headers=headers,
        timeout=10
    )

    if response.status_code == 200:
        result = response.json().get("result", {})
        points_count = result.get('points_count', 0)

        print(f"Total points in collection: {points_count}")

        if points_count > 0:
            print(f"\n✅ Data Status: LOADED")
            print(f"  The collection has {points_count} textbook chunks")
            print(f"  Vector search should work correctly")

            # Try to fetch a few points to check structure
            try:
                response = requests.post(
                    f"{QDRANT_URL}/collections/{COLLECTION_NAME}/points/query",
                    headers=headers,
                    json={
                        "query": [0.1] * 768,
                        "limit": 1
                    },
                    timeout=10
                )

                if response.status_code == 200:
                    point = response.json().get("result", {}).get("points", [{}])[0]
                    payload = point.get('payload', {})

                    print(f"\n  Sample Point Structure:")
                    print(f"    ID: {point.get('id')}")
                    print(f"    Score: {point.get('score', 'N/A')}")
                    print(f"    Payload keys: {list(payload.keys())}")
                    for key, value in payload.items():
                        if isinstance(value, str):
                            value_preview = value[:40]
                        else:
                            value_preview = str(value)[:40]
                        print(f"      - {key}: {value_preview}")

            except:
                print(f"\n  Could not fetch sample point details")
        else:
            print(f"\n❌ Data Status: EMPTY")
            print(f"  The collection has NO points")
            print(f"  Action needed: Load textbook data into Qdrant")

except Exception as e:
    print(f"❌ ERROR: {str(e)}")

# ============================================================================
# TEST 5: API Health Check
# ============================================================================
print("\n\nTEST 5: API Health & Quotas")
print("-" * 100)

try:
    # Try to get all collections to test API access
    response = requests.get(
        f"{QDRANT_URL}/collections",
        headers=headers,
        timeout=10
    )

    if response.status_code == 200:
        collections = response.json().get("result", {}).get("collections", [])
        print(f"✅ API is healthy")
        print(f"  Total collections: {len(collections)}")
        print(f"  Collections: {[c.get('name') for c in collections]}")
    else:
        print(f"⚠️  API returned status {response.status_code}")

except Exception as e:
    print(f"⚠️  API connection issue: {str(e)}")

# ============================================================================
# SUMMARY
# ============================================================================
print("\n\n" + "=" * 100)
print("SUMMARY")
print("=" * 100)

print("""
KEY FINDINGS:
✅ = Issue confirmed resolved
❌ = Issue detected
⚠️  = Warning/potential issue

WHAT TO CHECK:
1. If collection has 0 points → Load data into Qdrant
2. If search returns 400 errors → Check vector dimension (should be 768)
3. If named vectors fail → Collection doesn't use named vectors
4. If all tests pass → Qdrant is working correctly, any 429 is from other APIs

NEXT STEPS:
- If 429 errors occur, they're NOT from Qdrant (this script tests it)
- Check Gemini API rate limits (most likely culprit for 429 on agent)
- Check Hugging Face API rate limits (less likely, but possible)
- Consider adding retry logic with exponential backoff
""")

print("\nTest completed!")
