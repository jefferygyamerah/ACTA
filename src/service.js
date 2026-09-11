import { randomUUID } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { Store } from './store.js';
import { sourceSnapshot } from './sucursal/procedimiento.js';
import { selectProcedure } from './sucursal/selection.js';
import { llaveNodo, sellar, verificar, huella } from './core/sello.js';
import { sha256, root } from './runtime/assets.js';
export const fail = (message, status = 409) => { throw Object.assign(new Error(message), { status }); };
const nonempty = (v, max = 4000) => typeof v === 'string' && v.trim().length && v.length <= max;
export const missingItems = ['Constancia ficticia de domicilio', 'Declaración ficticia de origen de fondos', 'Cédula ficticia vigente'];
export function verifyExport(record, trustedKey) {
  try {
    if (!trustedKey || record?.sello?.publica !== trustedKey.trim()) return { valid: false, reason: 'La llave no corresponde a la llave de confianza.' };
    if (record.schema !== 'acta-reviewed-record-v1' || record.finalTextHash !== sha256(record.finalText)) return { valid: false, reason: 'El texto revisado o su huella cambió.' };
    const result = verificar(record);
    return { valid: result.valido, reason: result.valido ? 'Contenido íntegro y firma de la llave local de confianza.' : result.motivo };
  } catch { return { valid: false, reason: 'Archivo o firma inválidos.' }; }
}
export class CaseService {
  constructor({ directory, runtime, guidePath = path.join(root, 'fixtures/sucursal/guia-bpl.md'), automation = false }) {
    this.store = new Store(directory); this.runtime = runtime; this.guidePath = guidePath; this.automation = automation;
    this.key = llaveNodo(path.join(directory, 'signing-key.pem'));
    writeFileSync(path.join(directory, 'trusted-public-key.txt'), this.key.publica + '\n');
    this.sessions = new Map();
  }
  source() { return sourceSnapshot(this.guidePath); }
  session() { const id = randomUUID(); this.sessions.set(id, { selected: null, generation: 0 }); return id; }
  context(sid) { const s = this.sessions.get(sid); if (!s) fail('Sesión vencida. Recargue la página.', 401); return s; }
  select(sid, id) { this.case(id); const s = this.context(sid); s.selected = id; s.generation++; return this.get(sid, id); }
  cancel(sid) { this.context(sid).generation++; return { cancelled: true }; }
  case(id) { const c = this.store.get(id); if (!c) fail('Caso inexistente.', 404); return c; }
  active(sid, id) { if (this.context(sid).selected !== id) fail('El caso seleccionado cambió.'); return this.case(id); }
  editable(sid, id, revision) { const c = this.active(sid, id); if (c.revision !== revision) fail('La revisión cambió. Recargue el caso.'); if (c.lifecycle === 'reviewed') fail('El acta guardada es inmutable. Abra otro caso.'); return c; }
  create(sid, { title = 'Apertura de cuenta de ahorro', facts = 'Persona natural adulta panameña. Presenta cédula ficticia vigente y declaración ficticia de origen de fondos. Falta constancia ficticia de domicilio.' } = {}) {
    if (!nonempty(title, 100) || !nonempty(facts)) fail('Ingrese título y hechos sintéticos válidos.', 400);
    const c = { id: randomUUID(), reference: 'ACTA-' + randomUUID().slice(0, 6).toUpperCase(), title, facts, synthetic: true, revision: 1, createdAt: new Date().toISOString(), lifecycle: 'draft', disposition: 'Pendiente de revisión', missingDocument: '', note: '', contact: null, sourceReview: null, queries: [] };
    this.store.put(c); return this.select(sid, c.id);
  }
  get(sid, id) { const c = this.active(sid, id), records = this.store.records(id); if (records.some(r => !verifyExport(r, this.key.publica).valid)) fail('El acta almacenada no supera la verificación de integridad.', 500); return { ...c, records }; }
  edit(sid, id, data) {
    const c = this.editable(sid, id, data.revision);
    if (!nonempty(data.facts) || typeof data.note !== 'string' || data.note.length > 4000 || (data.missingDocument && !missingItems.includes(data.missingDocument))) fail('Hechos o documento inválidos.', 400);
    Object.assign(c, { facts: data.facts, note: data.note, missingDocument: data.missingDocument || '', revision: c.revision + 1, sourceReview: null, contact: null });
    this.context(sid).generation++; return this.store.put(c);
  }
  async query(sid, id, { revision, question }) {
    if (!nonempty(question, 1000)) fail('Escriba una consulta de hasta 1.000 caracteres.', 400);
    this.editable(sid, id, revision);
    const generation = this.context(sid).generation, source = this.source();
    const { result, evidence } = await selectProcedure(this.runtime, source, question);
    const after = this.editable(sid, id, revision);
    if (this.context(sid).generation !== generation || this.source().sourceHash !== source.sourceHash) fail('Resultado descartado: cambió el caso, la fuente o se canceló la consulta.');
    const query = { queryId: randomUUID(), caseId: id, reviewRevision: revision, sourceHash: source.sourceHash, sourceVersion: source.version, question, runId: evidence.runId, ...result, evidence };
    after.queries.push(query); if (query.covered) after.sourceReview = null;
    this.store.put(after); return query;
  }
  currentQueries(c, source) { return c.queries.filter(q => q.reviewRevision === c.revision && q.sourceHash === source.sourceHash && q.covered); }
  reviewSource(sid, id, { revision, sourceHash, queryIds }) {
    const c = this.editable(sid, id, revision), source = this.source(), queries = this.currentQueries(c, source);
    if (sourceHash !== source.sourceHash || !queries.length || !Array.isArray(queryIds) || huella([...queryIds].sort()) !== huella(queries.map(q => q.queryId).sort())) fail('Inspeccione las fuentes vigentes de todas las respuestas incluidas.');
    c.sourceReview = { sourceHash, reviewRevision: revision, queryIds, confirmedAt: new Date().toISOString() }; return this.store.put(c);
  }
  assertBasis(c) {
    const source = this.source(), review = c.sourceReview, queries = this.currentQueries(c, source);
    if (!review || review.sourceHash !== source.sourceHash || review.reviewRevision !== c.revision || huella([...review.queryIds].sort()) !== huella(queries.map(q => q.queryId).sort())) fail('Revise y confirme las fuentes vigentes antes de continuar.');
    if (!queries.some(q => q.code === 'EX-DOC-01') || !queries.some(q => q.code === 'DOC-NAT-01')) fail('Incluya los requisitos documentales y la excepción por documento faltante.');
    if (!missingItems.includes(c.missingDocument)) fail('Confirme el documento faltante.');
    return { source, queries };
  }
  contact(sid, id, { revision, route, confirmedDocument, confirmedRoute }) {
    const c = this.editable(sid, id, revision); this.assertBasis(c);
    if (route !== 'En la sucursal (ruta de demostración)' || confirmedDocument !== true || confirmedRoute !== true) fail('Confirme el documento y la ruta de demostración.');
    c.contact = { text: 'Para continuar con la revisión de su solicitud, está pendiente: ' + c.missingDocument.toLowerCase() + '. Puede presentarlo en la sucursal para continuar la revisión.', route, state: 'prepared', delivery: 'not-sent', reviewRevision: revision, reviewed: false };
    return this.store.put(c);
  }
  preview(sid, id, { revision }) {
    const c = this.editable(sid, id, revision), { source, queries } = this.assertBasis(c);
    const finalText = [c.reference + ' · ' + c.title, 'REVISIÓN DOCUMENTAL · DATOS SINTÉTICOS', '', 'Hechos revisados', c.facts, '', 'Documento pendiente', c.missingDocument, '', 'Disposición del colaborador', 'Pendiente de documentación. Remitir al supervisor. La revisión no activa una cuenta.', '', 'Observación del colaborador', c.note || 'Sin observación adicional.', '', 'Respaldo', [...new Set(queries.map(q => q.code))].join(', ') + ' · ' + source.documentId + ' · versión ' + source.version, '', 'Contacto preparado (' + (c.contact ? 'sin envío' : 'no preparado') + ')', c.contact?.text || 'No se preparó un mensaje.'].join('\n');
    return { finalText, finalTextHash: sha256(finalText), revision, sourceHash: source.sourceHash };
  }
  save(sid, id, data) {
    this.active(sid, id);
    if (!nonempty(data.requestId, 100)) fail('Falta la clave de guardado.', 400);
    const requestHash = huella({ caseId: id, ...data }), prior = this.store.retry(data.requestId);
    if (prior) { if (prior.request_hash !== requestHash) fail('Clave de guardado usada con otro contenido.'); return JSON.parse(prior.body); }
    const c = this.editable(sid, id, data.revision), { source, queries } = this.assertBasis(c);
    if (data.approved !== true || data.sourceHash !== source.sourceHash || !nonempty(data.finalText, 24000) || sha256(data.finalText) !== data.finalTextHash) fail('Revise y apruebe el texto exacto antes de guardar.');
    if (data.disposition !== 'Pendiente de documentación') fail('Este caso debe quedar pendiente de documentación.');
    const record = sellar({ schema: 'acta-reviewed-record-v1', recordId: randomUUID(), caseId: id, reference: c.reference, synthetic: true, reviewRevision: c.revision,
      sourceDocumentId: source.documentId, sourceVersion: source.version, sourceHash: source.sourceHash, sources: queries.flatMap(q => q.citations),
      queryBindings: queries.map(q => ({ queryId: q.queryId, runId: q.runId, caseId: id, reviewRevision: c.revision, promptSha256: q.evidence.promptSha256, outputSha256: q.evidence.outputSha256, verificationRunId: q.evidence.verification?.runId || null, verificationOutputSha256: q.evidence.verification?.outputSha256 || null })), 
      finalText: data.finalText, finalTextHash: data.finalTextHash, disposition: data.disposition, missingDocument: c.missingDocument, contact: c.contact ? { ...c.contact, reviewed: true } : null,
      approvedAt: new Date().toISOString(), actor: this.automation ? 'automation:synthetic-e2e' : 'colaborador-local-no-autenticado',
      acceptanceScope: this.automation ? 'Automated approval mechanics; no human acceptance claimed.' : 'Explicit local review; actor identity is not authenticated.'
    }, this.key);
    c.lifecycle = 'reviewed'; c.disposition = data.disposition;
    this.store.save(c, record, data.requestId, requestHash); return record;
  }
  close() { this.store.close(); }
}
