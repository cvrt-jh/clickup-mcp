// Response slimming to reduce token usage.
// ClickUp API responses are extremely verbose; these helpers
// strip fields that are rarely useful in an LLM context.

type Obj = Record<string, unknown>;

function isObj(v: unknown): v is Obj {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

// Reduce a user object to essentials
function slimUser(u: unknown): unknown {
  if (!isObj(u)) return u;
  return { id: u.id, username: u.username, email: u.email };
}

// Reduce a status to just name + type
function slimStatus(s: unknown): unknown {
  if (!isObj(s)) return s;
  return { status: s.status, type: s.type, color: s.color };
}

// Reduce statuses array
function slimStatuses(arr: unknown): unknown {
  if (!Array.isArray(arr)) return arr;
  return arr.map(slimStatus);
}

// Slim a space object
export function slimSpace(s: unknown): unknown {
  if (!isObj(s)) return s;
  const out: Obj = {
    id: s.id,
    name: s.name,
    private: s.private,
    archived: s.archived,
    statuses: slimStatuses(s.statuses),
  };
  if (Array.isArray(s.members)) {
    out.members = s.members.map((m) => isObj(m) ? slimUser(m.user) : m);
  }
  return out;
}

// Slim a list object (as found nested in folders or standalone)
export function slimList(l: unknown): unknown {
  if (!isObj(l)) return l;
  return {
    id: l.id,
    name: l.name,
    content: l.content,
    task_count: l.task_count,
    archived: l.archived,
    space: l.space,
    statuses: slimStatuses(l.statuses),
  };
}

// Slim a folder object
export function slimFolder(f: unknown): unknown {
  if (!isObj(f)) return f;
  return {
    id: f.id,
    name: f.name,
    archived: f.archived,
    task_count: f.task_count,
    space: f.space,
    lists: Array.isArray(f.lists) ? f.lists.map(slimList) : f.lists,
  };
}

// Slim a task object — the biggest token saver
export function slimTask(t: unknown): unknown {
  if (!isObj(t)) return t;
  const out: Obj = {
    id: t.id,
    custom_id: t.custom_id,
    name: t.name,
    description: t.text_content || t.description,
    status: isObj(t.status) ? { status: (t.status as Obj).status, type: (t.status as Obj).type } : t.status,
    archived: t.archived,
    creator: slimUser(t.creator),
    assignees: Array.isArray(t.assignees) ? t.assignees.map(slimUser) : t.assignees,
    tags: Array.isArray(t.tags) ? t.tags.map((tag) => isObj(tag) ? tag.name : tag) : t.tags,
    priority: isObj(t.priority) ? { id: (t.priority as Obj).id, priority: (t.priority as Obj).priority } : t.priority,
    due_date: t.due_date,
    start_date: t.start_date,
    time_estimate: t.time_estimate,
    date_created: t.date_created,
    date_updated: t.date_updated,
    date_closed: t.date_closed,
    parent: t.parent,
    url: t.url,
    list: isObj(t.list) ? { id: (t.list as Obj).id, name: (t.list as Obj).name } : t.list,
    folder: isObj(t.folder) ? { id: (t.folder as Obj).id, name: (t.folder as Obj).name } : t.folder,
  };
  // Keep non-empty arrays
  if (Array.isArray(t.checklists) && t.checklists.length > 0) out.checklists = t.checklists;
  if (Array.isArray(t.dependencies) && t.dependencies.length > 0) out.dependencies = t.dependencies;
  if (Array.isArray(t.linked_tasks) && t.linked_tasks.length > 0) out.linked_tasks = t.linked_tasks;
  if (Array.isArray(t.custom_fields) && t.custom_fields.length > 0) out.custom_fields = t.custom_fields;
  if (Array.isArray(t.subtasks) && t.subtasks.length > 0) out.subtasks = t.subtasks.map(slimTask);
  return out;
}

// Slim a comment create/reply response (strip version blob)
export function slimCommentResponse(c: unknown): unknown {
  if (!isObj(c)) return c;
  return { id: c.id, date: c.date };
}

// Slim a member from workspace response
export function slimMember(m: unknown): unknown {
  if (!isObj(m)) return m;
  const out: Obj = {};
  if (m.workspace_id) out.workspace_id = m.workspace_id;
  if (m.workspace_name) out.workspace_name = m.workspace_name;
  if (isObj(m.user)) {
    const u = m.user as Obj;
    out.id = u.id;
    out.username = u.username;
    out.email = u.email;
    out.role = u.role_key || u.role;
  } else {
    Object.assign(out, m);
  }
  return out;
}

// Slim a list member response
export function slimListMember(m: unknown): unknown {
  if (!isObj(m)) return m;
  return { id: m.id, username: m.username, email: m.email };
}

// Generic: apply slimmer to items in a keyed response { key: [...] }
export function slimArray<T>(data: unknown, key: string, fn: (item: unknown) => T): unknown {
  if (!isObj(data)) return data;
  const arr = data[key];
  if (!Array.isArray(arr)) return data;
  return { ...data, [key]: arr.map(fn) };
}
