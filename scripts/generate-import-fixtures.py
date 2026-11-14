"""Generate small synthetic parser fixtures without external libraries."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
from xml.sax.saxutils import escape
out = Path('docs/samples')
out.mkdir(parents=True, exist_ok=True)
lines = ['Exercise: Synthetic test activity', 'Instructions: Source instructions retained exactly.', 'Sets: 2', 'Repetitions: 8', 'Duration: 30 seconds', 'Frequency: As authored', 'Schedule: 14,15', 'Notes: Synthetic demonstration. Not medical advice.']
(out/'synthetic-plan.txt').write_text('\n'.join(lines), encoding='utf-8')
(out/'synthetic-plan.csv').write_text('exercise,instructions,sets,repetitions,duration,frequency,schedule,notes\nSynthetic test activity,Source instructions retained exactly.,2,8,30 seconds,As authored,"14,15",Synthetic demonstration. Not medical advice.\n', encoding='utf-8')
with ZipFile(out/'synthetic-plan.docx','w',ZIP_DEFLATED) as z:
    z.writestr('[Content_Types].xml', '<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>')
    z.writestr('_rels/.rels','<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>')
    z.writestr('word/document.xml','<?xml version="1.0"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p>'+''.join('<w:r><w:t>'+escape(line)+'</w:t><w:br/></w:r>' for line in lines)+'</w:p></w:body></w:document>')
def pdf(name, text):
    stream = ('BT /F1 11 Tf 50 760 Td 16 TL '+ ' T* '.join('('+line.replace('\\','\\\\').replace('(','\\(').replace(')','\\)')+') Tj' for line in text) +' ET').encode('ascii')
    objects = [b'<< /Type /Catalog /Pages 2 0 R >>',b'<< /Type /Pages /Kids [3 0 R] /Count 1 >>',b'<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',b'<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',b'<< /Length '+str(len(stream)).encode()+b' >>\nstream\n'+stream+b'\nendstream']
    data=b'%PDF-1.4\n'; offsets=[0]
    for i,obj in enumerate(objects,1): offsets.append(len(data));data+=str(i).encode()+b' 0 obj\n'+obj+b'\nendobj\n'
    pos=len(data);data+=b'xref\n0 6\n0000000000 65535 f \n'+b''.join(f'{n:010} 00000 n \n'.encode() for n in offsets[1:])+b'trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n'+str(pos).encode()+b'\n%%EOF\n'
    (out/name).write_bytes(data)
pdf('synthetic-plan.pdf', lines)
pdf('no-text.pdf', [])
