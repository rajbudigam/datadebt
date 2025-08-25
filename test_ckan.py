#!/usr/bin/env python3
import httpx
import json

def test_health():
    print("Testing health endpoint...")
    try:
        response = httpx.get("http://localhost:8000/health", timeout=10)
        print(f"Health check: {response.status_code} - {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Health check failed: {e}")
        return False

def test_ckan_scan():
    print("Testing CKAN scan...")
    try:
        url = "http://localhost:8000/scan/ckan"
        params = {
            "portal": "https://catalog.data.gov",
            "query": "water",
            "rows": 2
        }
        
        response = httpx.post(url, params=params, timeout=30)
        print(f"CKAN scan: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Found {data.get('total', 0)} datasets")
            print(f"Average score: {data.get('avg_score', 0)}")
            if data.get('results'):
                for i, result in enumerate(data['results'][:2]):
                    print(f"  Dataset {i+1}: {result['dataset']['title'][:50]}... Score: {result['score']}")
            return True
        else:
            print(f"Error response: {response.text}")
            return False
            
    except Exception as e:
        print(f"CKAN scan failed: {e}")
        return False

if __name__ == "__main__":
    print("DataDebt Backend Test")
    print("=" * 40)
    
    if test_health():
        test_ckan_scan()
    else:
        print("Backend not responding, skipping CKAN test")
