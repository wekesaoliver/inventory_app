const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'change-me';

function requireAdminPassword(req, res, next) {
  const submittedPassword = req.body.adminPassword;

  if (!submittedPassword || submittedPassword !== ADMIN_PASSWORD) {
    // Determine if this is an edit form or delete form
    const isEdit = req.method === 'PUT';
    const isDelete = req.method === 'DELETE';

    if (isEdit) {
      // For edit forms, we need to redirect back to the edit form with error
      // But we need the original data. For now, pass error via query or render directly
      // Since we don't have session/flash, we'll need to handle this in the controller
      // For simplicity, just set an error flag that controllers can check
      req.adminPasswordError = submittedPassword
        ? 'Invalid admin password.'
        : 'Admin password is required.';
      // Let it continue to controller which will handle the error display
      return next();
    }

    // For delete or other actions, show password form
    return res.status(403).render('admin-password-required', {
      title: 'Admin Password Required',
      returnUrl: req.get('Referer') || '/',
      action: req.originalUrl,
      method: req.method,
      errors: submittedPassword ? ['Invalid admin password.'] : ['Admin password is required for this action.'],
    });
  }

  // Password is correct, remove it from body and continue
  delete req.body.adminPassword;
  next();
}

module.exports = requireAdminPassword;
