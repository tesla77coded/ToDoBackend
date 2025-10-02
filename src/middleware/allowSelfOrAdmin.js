export default function allowSelfOrAdmin(req, res, next) {
  const requesterId = String(req.user?.id || req.user?._id);
  const paramId = String(req.params.id);

  if (!requesterId) return res.status(401).json({ message: 'Not authorized.' });
  if (req.user.isAdmin) return next();
  if (requesterId === paramId) return next();

  return res.status(403).json({ message: 'Forbidden: cannot update other users.' });
}
