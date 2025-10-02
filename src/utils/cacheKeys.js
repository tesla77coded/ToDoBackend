export const taskKey = (taskId) => `task:${taskId}`;

//List key: owner + stable filters (status, q, sort, archived)

export const tasksListKey = ({ owner, status = '', q = '', sort = 'createdAt:desc', archived = '' }) => {
  return `tasks:list:${owner}:status=${status}:q=${encodeURIComponent(q || '')}:sort=${encodeURIComponent(sort)}:archived=${archived}`;
};
