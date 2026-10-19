import { createClient } from 'npm:@supabase/supabase-js@2';

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const BUCKET = 'comprobantes-pago';
const ALLOWED_FILES: Record<string, { extension: string; signature: (bytes: Uint8Array) => boolean }> = {
  'image/jpeg': { extension: 'jpg', signature: (b) => b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  'image/png': { extension: 'png', signature: (b) => b.length >= 8 && [137, 80, 78, 71, 13, 10, 26, 10].every((value, index) => b[index] === value) },
  'image/webp': { extension: 'webp', signature: (b) => b.length >= 12 && textAt(b, 0, 4) === 'RIFF' && textAt(b, 8, 4) === 'WEBP' },
  'application/pdf': { extension: 'pdf', signature: (b) => b.length >= 5 && textAt(b, 0, 5) === '%PDF-' },
};

function textAt(bytes: Uint8Array, start: number, length: number) {
  return String.fromCharCode(...bytes.slice(start, start + length));
}

function response(body: Record<string, unknown>, status: number, origin: string | null) {
  const headers = new Headers({ 'Content-Type': 'application/json', Vary: 'Origin' });
  if (origin) headers.set('Access-Control-Allow-Origin', origin);
  return new Response(JSON.stringify(body), { status, headers });
}

function allowedOrigin(request: Request) {
  const origin = request.headers.get('Origin');
  const configuredOrigin = Deno.env.get('PAYMENT_PROOF_ALLOWED_ORIGIN');
  const allowed = new Set([
    'https://marlonstv120.github.io',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    ...(configuredOrigin ? [configuredOrigin] : []),
  ]);
  return origin && allowed.has(origin) ? origin : null;
}

Deno.serve(async (request) => {
  const origin = allowedOrigin(request);
  if (request.method === 'OPTIONS') {
    if (!origin) return new Response(null, { status: 403 });
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
        'Access-Control-Max-Age': '86400',
        Vary: 'Origin',
      },
    });
  }
  if (request.method !== 'POST' || !origin) return response({ error: 'Solicitud no permitida' }, 403, origin);

  const url = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !serviceRoleKey) return response({ error: 'No pudimos enviar el comprobante. Intenta nuevamente.' }, 500, origin);

  try {
    const form = await request.formData();
    const code = String(form.get('code') ?? '').trim();
    const token = String(form.get('token') ?? '').trim();
    const file = form.get('file');
    if (!/^ES-[0-9]+$/.test(code) || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(token) || !(file instanceof File)) {
      return response({ error: 'No pudimos validar esta solicitud.' }, 400, origin);
    }
    if (file.size < 1 || file.size > MAX_FILE_BYTES) return response({ error: 'El archivo supera el máximo de 5 MiB.' }, 400, origin);
    const rule = ALLOWED_FILES[file.type];
    const suppliedExtension = file.name.split('.').pop()?.toLowerCase();
    const extensionMatches = suppliedExtension === rule?.extension || (rule?.extension === 'jpg' && suppliedExtension === 'jpeg');
    if (!rule || !extensionMatches) {
      return response({ error: 'Formato no permitido. Usa JPG, PNG, WebP o PDF.' }, 400, origin);
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    if (!rule.signature(bytes)) return response({ error: 'El contenido del archivo no coincide con su formato.' }, 400, origin);

    const client = createClient(url, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data: authorization, error: authorizationError } = await client.rpc('validar_envio_comprobante_pago', {
      p_codigo: code,
      p_token_cliente: token,
    });
    if (authorizationError || !authorization?.[0]) return response({ error: 'Esta solicitud ya no admite comprobantes.' }, 409, origin);

    const requestId = authorization[0].solicitud_id;
    const path = `solicitudes/${requestId}/${crypto.randomUUID()}.${rule.extension}`;
    const { error: uploadError } = await client.storage.from(BUCKET).upload(path, bytes, { contentType: file.type, upsert: false });
    if (uploadError) return response({ error: 'No fue posible subir el comprobante. Intenta nuevamente.' }, 502, origin);

    const { error: saveError } = await client.rpc('registrar_comprobante_pago_desde_edge', {
      p_codigo: code,
      p_token_cliente: token,
      p_path: path,
      p_mime: file.type,
      p_bytes: file.size,
      p_nombre_original: file.name,
    });
    if (saveError) {
      await client.storage.from(BUCKET).remove([path]);
      return response({ error: 'Esta solicitud ya no admite comprobantes.' }, 409, origin);
    }
    return response({ estado_pago: 'comprobante_enviado' }, 200, origin);
  } catch {
    return response({ error: 'No fue posible subir el comprobante. Intenta nuevamente.' }, 500, origin);
  }
});
