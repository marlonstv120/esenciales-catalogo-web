export function readDraft(storage, key, { version, form }) {
  try {
    const draft = JSON.parse(storage?.getItem(key) || 'null');
    return draft?.version === version && draft?.form === form && Number.isFinite(draft.updatedAt) && draft.values && typeof draft.values === 'object' ? draft : null;
  } catch {
    return null;
  }
}

export function writeDraft(storage, key, { version, form, values }) {
  try {
    storage?.setItem(key, JSON.stringify({ version, form, updatedAt: Date.now(), values }));
    return true;
  } catch {
    return false;
  }
}

export function removeDraft(storage, key) {
  try {
    storage?.removeItem(key);
  } catch {
    // Storage can be disabled without preventing the form from working.
  }
}

export function createDraftSaver(storage, key, metadata, delay = 300) {
  let timer = null;
  let values = null;
  const flush = () => {
    if (timer) globalThis.clearTimeout(timer);
    timer = null;
    if (values) writeDraft(storage, key, { ...metadata, values });
  };
  return {
    save(nextValues) {
      values = nextValues;
      if (timer) globalThis.clearTimeout(timer);
      timer = globalThis.setTimeout(flush, delay);
    },
    flush,
    clear() {
      if (timer) globalThis.clearTimeout(timer);
      timer = null;
      values = null;
      removeDraft(storage, key);
    },
    destroy() {
      if (timer) globalThis.clearTimeout(timer);
      timer = null;
    },
  };
}
