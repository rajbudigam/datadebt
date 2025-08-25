from pydantic import BaseModel, HttpUrl, Field
from typing import List, Optional, Dict, Any

class DistributionRef(BaseModel):
    url: Optional[str] = None
    format: Optional[str] = None
    media_type: Optional[str] = None
    size: Optional[int] = None

class DatasetRef(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    portal: Optional[str] = None
    landing_page: Optional[str] = None
    license: Optional[str] = None
    keywords: List[str] = []
    modified: Optional[str] = None
    accrual_periodicity: Optional[str] = None
    distributions: List[DistributionRef] = []

class BucketScores(BaseModel):
    metadata: float
    access: float
    quality: float
    timeliness: float
    discoverability: float
    compliance: float

class DebtEvidence(BaseModel):
    missing_fields: List[str] = []
    access_notes: List[str] = []
    quality_summary: Dict[str, Any] = {}
    timeliness_days: Optional[int] = None
    discoverability_found: bool = False
    compliance_notes: List[str] = []

class DatasetScore(BaseModel):
    dataset: DatasetRef
    score: float
    buckets: BucketScores
    evidence: DebtEvidence

class PortalScanResult(BaseModel):
    portal: str
    query: Optional[str] = None
    total: int
    avg_score: float
    results: List[DatasetScore]
