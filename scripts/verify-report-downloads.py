import argparse,csv,io,json
from pathlib import Path
from pypdf import PdfReader
p=argparse.ArgumentParser(description='Check downloaded RecoveryMap filtered report files agree. Requires pypdf.')
p.add_argument('--pdf',required=True);p.add_argument('--json',required=True);p.add_argument('--csv',required=True)
a=p.parse_args();r=json.loads(Path(a.json).read_text(encoding='utf-8'));rows=list(csv.DictReader(io.StringIO(Path(a.csv).read_text(encoding='utf-8'))));pdf=PdfReader(a.pdf);text='\n'.join(page.extract_text() for page in pdf.pages)
assert len(r['assessments'])==len(rows)
assert {x['sourceRowId'] for x in rows}=={x['id'] for x in r['assessments']}
assert all(x['profileId']==r['profile']['id'] for x in rows)
assert f"Adherence: {r['stats']['completed']}/{r['stats']['total']}" in text
assert f"Date range: {r['from'] or 'All'} to {r['to'] or 'All'}" in text
if r['latestPair']:assert f"{r['latestPair']['gap']:.4f} pp" in text
assert not any(x['sourceType']=='NASA_CFT70' for x in rows)
print(json.dumps({'pdfPages':len(pdf.pages),'assessmentRows':len(rows),'dateRangeMatches':True,'adherenceMatches':True,'gapMatches':True,'profileIsolation':True}))
