from pathlib import Path
import csv,json,urllib.request,hashlib,statistics
P=Path(__file__).resolve().parent.parent/'public'/'data'/'cft70'
sources={'force.csv':'https://nlsp.nasa.gov/api/v1/files/37bf8b59-9caf-52d8-99d6-b5c9e50cd4c1/download','slalom.csv':'https://nlsp.nasa.gov/api/v1/files/ad489c35-7610-5065-866e-cd336256f5ad/download'}
manifest=[];data=[];raw={}
for name,url in sources.items():
    path=P/'raw'/name
    if not path.exists(): path.write_bytes(urllib.request.urlopen(url,timeout=45).read())
    rows=list(csv.DictReader(path.read_text(encoding='utf-8-sig').splitlines())); raw[name]=rows
    expected_hash={'force.csv':'296da01c055f15dd4410ddb8ae3ecd78ff515a26d4cb09ff6d81dbd17c2db947','slalom.csv':'39fee8f94ebe647926ab3b4ab4a2113f8921674be7b152718c15d85442a0346b'}[name]
    assert hashlib.sha256(path.read_bytes()).hexdigest()==expected_hash, 'Original CSV hash mismatch'
    assert len(rows)==(238 if name=='force.csv' else 243) and len(rows[0])==9
    assert len({r['Subject'] for r in rows})==35 and sum(r['Date'].strip() in ('','NA') for r in rows)==14
    metric,unit,col=('leg_force','N','Force_N') if name=='force.csv' else ('slalom_time','s','Time_sec')
    manifest.append(dict(file=name,url=url,sha256=hashlib.sha256(path.read_bytes()).hexdigest(),rows=len(rows),participants=len({r['Subject'] for r in rows})))
    for r in rows:
        data.append(dict(source='NASA_CFT70',sourceFile=name,sourceRowId=r['ID'],participantId=r['Subject'],group=r['GroupName'],session=r['Session'],phase=r['Test_Phase'],brDay=int(r['BR_Day']),sourceDate=None if r['Date'].strip() in ('','NA') else r['Date'],metric=metric,unit=unit,value=float(r[col]),environment='Earth head-down bed-rest analog',readOnly=True))
profiles=[]
for pid in sorted({r['participantId'] for r in data}):
    metrics={}
    for metric in ['leg_force','slalom_time']:
        rr=[r for r in data if r['participantId']==pid and r['metric']==metric]
        bc=[r for r in rr if r['session'] in ['B','C']]
        baseline=statistics.mean(r['value'] for r in bc) if len(bc)==2 and len({r['session'] for r in bc})==2 else None
        metrics[metric]={'baselineBC':baseline,'observations':rr}
    profiles.append(dict(participantId=pid,metrics=metrics))
complete=[]
for p in profiles:
    m=p['metrics']; f=m['leg_force'];t=m['slalom_time'];fd=[r for r in f['observations'] if r['session']=='D'];td=[r for r in t['observations'] if r['session']=='D']
    if f['baselineBC'] and t['baselineBC'] and len(fd)==len(td)==1:
        force=100*(fd[0]['value']/f['baselineBC']-1);time=100*(td[0]['value']/t['baselineBC']-1);perf=100*(t['baselineBC']/td[0]['value']-1)
        complete.append(dict(participantId=p['participantId'],forceChangePct=force,timeChangePct=time,mobilityPerformanceChangePct=perf,gapPercentagePoints=force-perf))
p9023=next(p for p in profiles if p['participantId']=='9023');c9023=next(p for p in complete if p['participantId']=='9023')
assert len(data)==481 and len(profiles)==35 and len(complete)==33
assert abs(p9023['metrics']['leg_force']['baselineBC']-3342.69424)<1e-8
assert abs(p9023['metrics']['slalom_time']['baselineBC']-8.548)<1e-8
for metric,expected in [('leg_force',[3319.67584,3209.0096,3473.13184,3372.20672]),('slalom_time',[10.955,8.616,8.026,8.276])]:
    for session,day,value in zip('DEFG',[0,1,6,11],expected):
        r=next(r for r in p9023['metrics'][metric]['observations'] if r['session']==session)
        assert r['phase']=='POST_TEST' and r['brDay']==day and abs(r['value']-value)<1e-10
assert abs(c9023['forceChangePct']-(-0.6886181728664509))<1e-10
assert abs(c9023['timeChangePct']-28.15863359850257)<1e-10
assert abs(c9023['mobilityPerformanceChangePct']-(-21.97170241898676))<1e-10
assert abs(c9023['gapPercentagePoints']-21.283084246120307)<1e-10
out={'dataset':'NASA CFT70 Functional Task Test','datasetId':'933d244c-5967-54ee-90c6-ce560da2108d','baselineMethod':'Mean of B and C only when both present; A excluded; no single-point fallback','sources':manifest,'participants':profiles,'pairedFirstPost':complete,'summary':{'participants':35,'forceRows':238,'slalomRows':243,'completePairedFirstPost':33,'subject9023':c9023}}
(P/'cft70.normalized.json').write_text(json.dumps(out,ensure_ascii=False,indent=2))
(P/'manifest.json').write_text(json.dumps(manifest,indent=2))
print(json.dumps(out['summary'],indent=2))
